import { fetchMessage, handlePostMessage } from '@/apis'
import ToastComponent from '@/components/ToastComponent'
import { typeOfBlockMessage, typeOfRule, typeOfSocket, typeOfUser } from '@/constants'
import ConverstaionsSkeleton from '@/modules/ConversationsSkeleton'
import { Message, TConversationInfo, THandleSendMessage, THandleSendMessageApi, TMeta, TPayloadHandleSendMessageApi } from '@/types'
import { groupConsecutiveMessages } from '@/utils'
import { useNetworkState, useVisibilityChange } from '@uidotdev/usehooks'
import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import useSound from 'use-sound'
import seenSound from '../../public/seen.mp4'

const Header = lazy(() => import('@/layouts/Header'))
const FooterInput = lazy(() => import('@/modules/FooterInput/FooterInput'))
const Conversation = lazy(() => import('@/modules/Conversation/Conversation'))

import { useSocket } from '@/context/SocketProvider'
import { translate } from '@/context/translationProvider'
import { CircularProgress } from '@nextui-org/react'
import { BackgroundBeamsWithCollision } from '@/components/BackgroundBeamsWithCollision'
import ImageCustom from '@/components/ImageCustom'
import { AnimatePresence } from 'framer-motion'
import { ButtonOnlyIcon } from '@/components/Buttons'
import { ArrowDown } from 'iconsax-react'

const HomePage = () => {
  const m = translate('MessageOfMessageBlock')

  const queryParams = new URLSearchParams(location.search)
  const socket: any = useSocket()
  const orderId = Number(queryParams.get('orderId'))
  const user_id = Number(queryParams.get('user_id'))
  const isCMS = !!user_id
  //sound
  const [play] = useSound(seenSound)

  const [onFetchingMessage, setOnFetchingMessage] = useState<boolean>(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [conversationInfo, setConversationInfo] = useState<TConversationInfo | null>(null)
  console.log({ conversationInfo })
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [onReloadMessage, setOnReloadMessage] = useState<boolean>(false)
  const [isCancleOrder, setIsCancleOrder] = useState<boolean>(false)
  const [messageBlock, setMessageBlock] = useState<string>('')
  const [meta, setMeta] = useState<TMeta | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoadMoreMessage, setIsLoadMoreMessage] = useState<boolean>(false)

  const groupedMessages = groupConsecutiveMessages(conversation)
  const groupedMessagesClone = [...groupedMessages]
  const groupedMessagesCloneReverse = [...groupedMessagesClone].reverse()
  const isCanLoadMore = meta ? currentPage < meta?.total_pages : false

  //@ts-ignore
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false)

  const documentVisible = useVisibilityChange()
  const network = useNetworkState()

  const handleSendMessage = useCallback(
    async ({ message, type = 0, attachment }: THandleSendMessage) => {
      // await handleGetMessage()
      const newMessage: Message = {
        content: message.trim(),
        // id: `${orderId}-${conversationInfo?.user_id}-${conversation?.length}`,
        id: Date.now(),
        seen: null,
        type,
        by: {
          id: isCMS ? typeOfUser.cms : Number(conversationInfo?.current_id),
          profile_picture: '',
          avatar: null,
          full_name: ''
        },
        created_at: Date.now(),
        status: 'pending'
      }

      // turn off typing
      socket.emit(typeOfSocket.MESSAGE_TYPING_CMS, {
        socket_id: socket.id,
        message: '',
        order_id: conversationInfo?.order_id,
        current_id: conversationInfo?.current_id,
        user_id: conversationInfo?.user_id
      })
      if (attachment) {
        newMessage.attachments = [{ url: URL.createObjectURL(attachment) }] as any
      }

      setConversation((prevConversation) => [...prevConversation, newMessage])

      try {
        await handleSendMessageApi({ message, messageId: newMessage?.id, type, attachment, socket_id: socket?.id })
        if (type == 1) {
          //khang
          // setOnReloadMessage(true)
          setCurrentPage(1)
        }
      } catch (error) {
        console.error(error)
      }
    },
    [conversation, conversationInfo, socket]
  )
  const handleSendMessageApi = async ({ message, messageId, type = 0, attachment, socket_id }: THandleSendMessageApi) => {
    let timer
    try {
      const payload: TPayloadHandleSendMessageApi = isCMS
        ? { content: message, user_id, type, socket_id, conversationId: conversationInfo?.conversation_id as number, messageId }
        : { content: message, type, socket_id, conversationId: conversationInfo?.conversation_id as number, messageId }

      if (type === 1) {
        payload.attachment = attachment
      }

      setIsSendingMessage(true)
      await handlePostMessage({ orderId, payload })
      clearTimeout(timer)

      setIsSendingMessage(false)

      setConversation((prevConversation) => prevConversation.map((msg) => (msg.id === messageId && msg.status !== typeOfSocket.SEEN ? { ...msg, status: 'sent' } : msg)))
    } catch (error) {
      console.error(error)
      setIsSendingMessage(false)
      setTimeout(() => {
        setConversation((prevConversation) => prevConversation.map((msg) => (msg.id === messageId ? { ...msg, status: 'failed' } : msg)))
      }, 300)
    }
  }

  const handleGetMessage = useCallback(
    async (isLoadMore: boolean = false) => {
      try {
        const data = await fetchMessage({ orderId, socket_id: socket?.id, ...(isCMS && { user_id }), page: currentPage, limit: 20 })

        setConversationInfo(data)

        if (isLoadMore) {
          // setItems((prevItems) => prevItems.concat(Array.from({ length: 20 })))
          // setConversation((prevConversation) => prevConversation.concat(data?.data))
          setConversation((prevConversation) => [...data?.data, ...prevConversation])
        } else {
          setConversation(data?.data)
        }

        setMeta(data?.meta)
      } catch (error) {
        console.error(error)
      } finally {
        setOnFetchingMessage(false)
        setIsLoadMoreMessage(false)
        setOnReloadMessage(false)
      }
    },
    [currentPage, isCMS, orderId, user_id]
  )

  const loadMoreMessages = useCallback(() => {
    if (meta && currentPage < meta.total_pages) {
      setCurrentPage((prevPage) => prevPage + 1)
      setIsLoadMoreMessage(true)
    }
  }, [meta, currentPage])

  useEffect(() => {
    if (onFetchingMessage) {
      handleGetMessage()
    }
  }, [onFetchingMessage, handleGetMessage])

  useEffect(() => {
    if (isLoadMoreMessage) {
      setTimeout(() => {
        handleGetMessage(true)
      }, 1500)
    }
  }, [isLoadMoreMessage, handleGetMessage])

  useEffect(() => {
    setOnFetchingMessage(true)
  }, [])

  const messageOfMessageBlock = {
    cancelOrder: m?.cancelOrder,
    acceptPrice: m?.acceptPrice,
    completeOrder: m?.completeOrder,
    expressGuarantee: m?.expressGuarantee
  } as const

  const getMessageByBlockType = (blockType: string): string | undefined => {
    //@ts-ignore
    const entry = Object.entries(typeOfBlockMessage).find(([key, value]) => value === blockType)
    return entry ? messageOfMessageBlock[entry[0] as keyof typeof messageOfMessageBlock] : undefined
  }

  // Ví dụ sử dụng
  // const messageBlock = getMessageByBlockType('BLOCKED BY COMPLETED ORDER')
  console.log({ conversationInfo })
  useEffect(() => {
    let fristTime = true
    if (!conversationInfo?.order_id || !conversationInfo?.user_id || conversationInfo == null || network.online === false || documentVisible === false) return

    socket.emit(typeOfSocket.JOIN_CONVERSATION_CMS, { user_id: conversationInfo?.user_id, order_id: conversationInfo?.order_id })

    socket.on(typeOfSocket.MESSAGE_BLOCK, (data: any) => {
      setMessageBlock(getMessageByBlockType(data?.status as string) || '')
      setIsCancleOrder(true)
    })
    socket.on(typeOfSocket.MESSAGE_SEEN_CMS, (data: any) => {
      console.log({ MESSAGE_SEEN_CMS: data })
      if (conversation.length === 0) return

      // seen all message in conversation when user get message
      if (data?.socket_id == socket?.id) return

      ToastComponent({
        type: 'success',
        message: 'Bạn đã nhận được tin nhắn mới'
      })

      setConversation((prev) =>
        prev.map((message) => ({
          ...message,
          status: 'seen'
        }))
      )

      if (isLoadMoreMessage) return

      if (fristTime) {
        play()
        fristTime = false
      }
    })
    socket.on(typeOfSocket.MESSAGE_SEEN, (data: any) => {
      if (conversation.length === 0) return

      // seen all message in conversation when user get message
      if (data.status === 'SEEN MESSAGE') {
        if (data?.socket_id == socket?.id) return

        ToastComponent({
          type: 'success',
          message: 'Bạn đã nhận được tin nhắn mới'
        })

        setConversation((prev) =>
          prev.map((message) => ({
            ...message,
            status: 'seen'
          }))
        )

        if (isLoadMoreMessage) return

        if (fristTime) {
          play()
          fristTime = false
        }
      } else {
      }
    })

    //@ts-ignore
    socket.on(typeOfSocket.SEEN, (data: any) => {
      // setConversation((prevConversation) => prevConversation.map((msg) => (msg.id == data?.data?.messageId ? { ...msg, status: 'seen' } : msg)))

      setConversation((prev) =>
        prev.map((message) => ({
          ...message,
          status: 'seen'
        }))
      )

      if (fristTime) {
        play()
        fristTime = false
      }
    })

    socket.on(typeOfSocket.MESSAGE_ARRIVE_CMS, (data: any) => {
      if (data?.socket_id == socket?.id) {
      } else {
        setConversation((prevConversation) => [...prevConversation, data?.message])
        socket.emit(typeOfSocket.SEEN, { messageId: data?.message?.id, conversationId: conversationInfo?.conversation_id, orderId: conversationInfo?.order_id, workerId: conversationInfo?.user_id })

        socket.emit(typeOfSocket.MESSAGE_SEEN_CMS, {
          user_id: conversationInfo?.user_id,
          order_id: conversationInfo?.order_id,
          message_id: data?.message?.id,
          conversation_id: conversationInfo?.conversation_id,
          socket_id: socket?.id
        })
      }
    })

    fristTime = true
    return () => {
      socket.emit(typeOfSocket.LEAVE_CONVERSATION_CMS, { workerId: conversationInfo?.user_id, orderId: conversationInfo?.order_id })
      socket.off(typeOfSocket.MESSAGE_ARRIVE_CMS)
      socket.off(typeOfSocket.MESSAGE_SEEN)
      socket.off(typeOfSocket.SEEN)
      // socket.off(typeOfSocket.MESSAGE_BLOCK)
    }
  }, [conversationInfo, conversation, socket])

  useEffect(() => {
    if (documentVisible) {
      console.log('khang123')
      setOnReloadMessage(true)

      const handleVisibilityChange = () => {
        socket?.emit(typeOfSocket.JOIN_CONVERSATION_CMS, { workerId: conversationInfo?.user_id, orderId: conversationInfo?.order_id })
      }

      handleVisibilityChange()
    }
  }, [documentVisible, network])

  useEffect(() => {
    if (onFetchingMessage) return
    onReloadMessage && handleGetMessage()
  }, [onReloadMessage, handleGetMessage, onFetchingMessage])

  const handleAutoSendMessage = async () => {
    if (true) return
    for (let i = 1; i <= 50; i++) {
      await handleSendMessage({ message: `Message ${i}` })
    }
  }

  useEffect(() => {
    setTimeout(() => {
      handleAutoSendMessage()
    }, 2000)
  }, [])

  const handleScroll = (e: any) => {
    const scrollTop = e.target.scrollTop // How much the user has scrolled vertically
    setShowScrollToBottom(scrollTop < -200)
  }

  return (
    <div className={`relative flex h-dvh flex-col bg-gradient-to-r from-sky-50 to-violet-50`}>
      <Suspense fallback={null}>
        <Header conversationInfo={conversationInfo} />
      </Suspense>
      <Suspense fallback={null}>
        <BackgroundBeamsWithCollision>
          {onFetchingMessage ? (
            <ConverstaionsSkeleton />
          ) : (
            <div
              id='scrollableDiv'
              style={{
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse'
              }}
              className='bg-gradient-to-r from-sky-50 to-violet-50'
            >
              <InfiniteScroll
                dataLength={conversation?.length}
                next={loadMoreMessages}
                style={{ display: 'flex', flexDirection: 'column-reverse', padding: '0 8px 10px 8px', gap: 12 }}
                inverse={true}
                hasMore={isCanLoadMore}
                onScroll={handleScroll}
                loader={
                  isLoadMoreMessage && (
                    <div
                      style={{
                        display: isLoadMoreMessage ? 'flex' : 'none'
                      }}
                      className='flex w-full items-center justify-center py-2'
                    >
                      <CircularProgress
                        size='md'
                        classNames={{
                          svg: 'h-6 w-6 text-primary-blue'
                        }}
                      />
                    </div>
                  )
                }
                scrollableTarget='scrollableDiv'
              >
                <AnimatePresence>
                  <ButtonOnlyIcon
                    onClick={() => {
                      const scrollableDiv = document.getElementById('scrollableDiv')
                      if (scrollableDiv) {
                        scrollableDiv.scrollTop = scrollableDiv.scrollHeight
                      }
                    }}
                    className={`absolute bottom-20 left-1/2 flex size-8 max-h-8 min-h-8 min-w-8 max-w-8 flex-shrink-0 -translate-x-1/2 transition-all duration-300 ${showScrollToBottom ? 'z-[100] translate-y-0 opacity-100' : 'translate-y-[120px]'} rounded-full bg-white p-2 text-primary-black shadow-lg`}
                  >
                    <ArrowDown className='size-4' />
                  </ButtonOnlyIcon>
                </AnimatePresence>
                {groupedMessagesCloneReverse?.length === 0 ? (
                  <div className='flex h-[calc(100vh-160px)] items-center justify-center'>
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <div>
                        <ImageCustom src='./support.png' alt='support' className='w-40 object-cover' height={160} width={160} />
                      </div>
                      <p className='px-[20%] text-center text-sm text-primary-gray'>Xin chào! Hãy đặt bất kì câu hỏi nào cho chúng tôi!</p>
                    </div>
                  </div>
                ) : (
                  <Conversation conversation={groupedMessagesCloneReverse} conversationInfo={conversationInfo} />
                )}
              </InfiniteScroll>
            </div>
          )}
        </BackgroundBeamsWithCollision>
      </Suspense>

      {isCancleOrder ? (
        <p className='z-50 bg-white p-3 text-center text-sm text-primary-gray'>{messageBlock}.</p>
      ) : (
        <Suspense fallback={null}>
          <FooterInput
            handleSendMessage={handleSendMessage}
            onReloadMessage={onReloadMessage}
            isSendingMessage={isSendingMessage}
            onFetchingMessage={onFetchingMessage}
            conversationInfo={conversationInfo}
          />
        </Suspense>
      )}
    </div>
  )
}

export default memo(HomePage)
