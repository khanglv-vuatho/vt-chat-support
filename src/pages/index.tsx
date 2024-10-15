import { fetchMessage, handlePostMessage } from '@/apis'
import ToastComponent from '@/components/ToastComponent'
import { typeOfSocket, typeOfUser } from '@/constants'
import ConverstaionsSkeleton from '@/modules/ConversationsSkeleton'
import { Message, TConversationInfo, THandleSendMessage, THandleSendMessageApi, TMeta, TPayloadHandleSendMessageApi } from '@/types'
import { groupConsecutiveMessages } from '@/utils'
import { useNetworkState, useVisibilityChange } from '@uidotdev/usehooks'
import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import useSound from 'use-sound'
import seenSound from '../../public/seen.mp4'

import { BackgroundBeamsWithCollision } from '@/components/BackgroundBeamsWithCollision'
import ImageCustom from '@/components/ImageCustom'
import { useSocket } from '@/context/SocketProvider'
import { Button, CircularProgress, Input } from '@nextui-org/react'
import ModalTest from '@/components/ModalTest'

const Header = lazy(() => import('@/layouts/Header'))
const FooterInput = lazy(() => import('@/modules/FooterInput/FooterInput'))
const Conversation = lazy(() => import('@/modules/Conversation/Conversation'))
const ScrollToBottom = lazy(() => import('@/components/ScrollToBottom'))

const HomePage = () => {
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
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [onReloadMessage, setOnReloadMessage] = useState<boolean>(false)
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
          setOnReloadMessage(true)
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
      handleScrollToBottom()

      setIsSendingMessage(false)

      setConversation((prevConversation) => prevConversation.map((msg) => (msg.id === messageId && msg.status !== 'seen' ? { ...msg, status: 'sent' } : msg)))
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

  useEffect(() => {
    let fristTime = true
    if (!conversationInfo?.order_id || !conversationInfo?.user_id || conversationInfo == null || network.online === false || documentVisible === false) return

    socket.emit(typeOfSocket.JOIN_CONVERSATION_CMS, { user_id: conversationInfo?.user_id, order_id: conversationInfo?.order_id })

    socket.on(typeOfSocket.MESSAGE_SEEN_CMS, (data: any) => {
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

    //@ts-ignore
    socket.on(typeOfSocket.SEEN, (data: any) => {
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
    }
  }, [conversationInfo, conversation, socket])

  useEffect(() => {
    if (documentVisible) {
      setOnReloadMessage(true)

      const handleVisibilityChange = () => {
        socket?.emit(typeOfSocket.JOIN_CONVERSATION_CMS, { workerId: conversationInfo?.user_id, orderId: conversationInfo?.order_id })
      }

      handleVisibilityChange()
    }
  }, [documentVisible, network])

  useEffect(() => {
    if (onFetchingMessage) return
    console.log('onReloadMessage', onReloadMessage)
    onReloadMessage && handleGetMessage()
  }, [onReloadMessage, handleGetMessage, onFetchingMessage])

  const handleScrollToShowButtonScroll = (e: any) => {
    const scrollTop = e.target.scrollTop // How much the user has scrolled vertically
    setShowScrollToBottom(scrollTop < -200)
  }

  const handleScrollToBottom = useCallback(() => {
    const scrollableDiv = document.getElementById('scrollableDiv')
    if (scrollableDiv) {
      const start = scrollableDiv.scrollTop
      const end = scrollableDiv.scrollHeight - scrollableDiv.clientHeight
      const duration = 300 // Adjust this value to control the speed (lower = faster)
      const startTime = performance.now()

      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.min(elapsedTime / duration, 1)
        const easeInOutCubic = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

        scrollableDiv.scrollTop = start + (end - start) * easeInOutCubic

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }

      requestAnimationFrame(animateScroll)
    }
  }, [])
  // test
  const [isOpenModalInviteMember, setIsOpenModalInviteMember] = useState(false)
  const [isInvitingMember, setIsInvitingMember] = useState(false)
  const handleOpenModalInviteMember = () => {
    setIsOpenModalInviteMember(true)
  }

  const handleInviteMember = () => {
    setIsInvitingMember(true)
  }

  return (
    <div className={`relative flex h-dvh flex-col bg-gradient-to-r from-sky-50 to-violet-50`}>
      <Suspense fallback={null}>
        <Header conversationInfo={conversationInfo} />
      </Suspense>
      <ModalTest isOpen={isOpenModalInviteMember} onOpenChange={() => setIsOpenModalInviteMember(false)} modalTitle='Invite Member' modalBody='Invite Member'>
        <div className='-mt-2 flex flex-col gap-4 py-2'>
          <Input
            value={''}
            placeholder={'Enter your invite email'}
            onChange={(e) => {
              // Handle input change here
              console.log(e.target.value)
            }}
            isRequired
            type='email'
          />
        </div>
        <div className='flex w-full justify-end'>
          <Button isLoading={isInvitingMember} className='bg-primary-blue text-white' onClick={() => handleInviteMember()}>
            Invite
          </Button>
        </div>
      </ModalTest>
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
                onScroll={handleScrollToShowButtonScroll}
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
                <Suspense fallback={null}>
                  <ScrollToBottom showScrollToBottom={showScrollToBottom} />
                </Suspense>
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
      <div className='' onClick={handleOpenModalInviteMember}>
        Test
      </div>
      <Suspense fallback={null}>
        <FooterInput
          handleSendMessage={handleSendMessage}
          onReloadMessage={onReloadMessage}
          isSendingMessage={isSendingMessage}
          onFetchingMessage={onFetchingMessage}
          conversationInfo={conversationInfo}
        />
      </Suspense>
    </div>
  )
}

export default memo(HomePage)
