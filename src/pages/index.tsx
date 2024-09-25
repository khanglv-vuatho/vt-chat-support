import { CircularProgress } from '@nextui-org/react'
import { useNetworkState, useVisibilityChange } from '@uidotdev/usehooks'
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { fetchMessage, handlePostMessage } from '@/apis'
import ToastComponent from '@/components/ToastComponent'
import { typeOfBlockMessage, typeOfRule, typeOfSocket } from '@/constants'
import { useSocket } from '@/context/SocketProvider'
import { translate } from '@/context/translationProvider'
import ConverstaionsSkeleton from '@/modules/ConversationsSkeleton'
import { Message, TConversationInfo, THandleSendMessage, THandleSendMessageApi, TMeta, TPayloadHandleSendMessageApi } from '@/types'
import { groupConsecutiveMessages } from '@/utils'

const Header = lazy(() => import('@/modules/Header/Header'))
const FooterInput = lazy(() => import('@/modules/FooterInput/FooterInput'))
const Conversation = lazy(() => import('@/modules/Conversation/Conversation'))

const HomePage = () => {
  const m = translate('MessageOfMessageBlock')

  const queryParams = new URLSearchParams(location.search)
  const socket: any = useSocket()
  const orderId = Number(queryParams.get('orderId'))
  const currentId = Number(queryParams.get('currentId'))
  const worker_id = Number(queryParams.get('worker_id'))

  const isClient = !!worker_id

  const [onFetchingMessage, setOnFetchingMessage] = useState<boolean>(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [conversationInfo, setConversationInfo] = useState<TConversationInfo | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [onReloadMessage, setOnReloadMessage] = useState<boolean>(false)
  const [isCancleOrder, setIsCancleOrder] = useState<boolean>(false)
  const [messageBlock, setMessageBlock] = useState<string>('')
  const [meta, setMeta] = useState<TMeta | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoadMoreMessage, setIsLoadMoreMessage] = useState<boolean>(false)
  const [scrollOfHeight, setScrollOfHeight] = useState<number[]>([])

  const groupedMessages = useMemo(() => groupConsecutiveMessages(conversation), [conversation])
  const documentVisible = useVisibilityChange()
  const network = useNetworkState()
  const scrollableRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = useCallback(
    async ({ message, type = 0, attachment }: THandleSendMessage) => {
      // await handleGetMessage()
      const newMessage: Message = {
        content: message.trim(),
        // id: `${orderId}-${conversationInfo?.worker_id}-${conversation?.length}`,
        id: Date.now(),
        seen: null,
        type,
        by: {
          id: currentId,
          profile_picture: '',
          avatar: null,
          full_name: ''
        },
        created_at: Date.now(),
        status: 'pending'
      }

      // turn off typing
      socket.emit(typeOfSocket.MESSAGE_TYPING, {
        socketId: socket.id,
        message: '',
        orderId: conversationInfo?.order_id,
        workerId: conversationInfo?.worker_id,
        currentId
      })

      if (attachment) {
        newMessage.attachments = [{ url: URL.createObjectURL(attachment) }] as any
      }

      setConversation((prevConversation) => [...prevConversation, newMessage])

      try {
        await handleSendMessageApi({ message, messageId: newMessage.id, type, attachment, socket_id: socket.id })
        if (type == 1) setOnReloadMessage(true)
      } catch (error) {
        console.error(error)
      }
    },
    [currentId, conversation, conversationInfo, socket]
  )

  const handleSendMessageApi = async ({ message, messageId, type = 0, attachment, socket_id }: THandleSendMessageApi) => {
    let timer
    try {
      const payload: TPayloadHandleSendMessageApi = isClient
        ? { content: message, worker_id, type, socket_id, conversationId: conversationInfo?.conversation_id as number, messageId }
        : { content: message, type, socket_id, conversationId: conversationInfo?.conversation_id as number, messageId }

      if (type === 1) {
        payload.attachment = attachment
      }

      setIsSendingMessage(true)
      await handlePostMessage({ orderId, payload, rule: isClient ? typeOfRule.CLIENT : typeOfRule.WORKER })
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
        const data = await fetchMessage({ orderId, ...(isClient && { worker_id }), page: currentPage, limit: 20 })

        setConversationInfo(data)

        if (!data?.worker_id || !data?.order_id) {
          return ToastComponent({
            type: 'error',
            message: 'Lỗi mạng vui lòng kiểm tra lại'
          })
        }
        if (isLoadMore) {
          setConversation((prevConversation) => [...data?.data, ...prevConversation])
        } else {
          setConversation(data?.data)
        }

        // scroll to top
        if (isLoadMore) {
          if (scrollableRef.current) {
            // console.log(scrollableRef.current?.offsetHeight, scrollableRef.current.scrollTop)
            scrollableRef.current.scrollTop = (scrollOfHeight?.[currentPage - 3] || scrollOfHeight?.[0]) / 2 + 60
          }
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
    [currentPage, isClient, orderId, worker_id]
  )

  const loadMoreMessages = useCallback(() => {
    if (scrollableRef.current) {
      console.log(scrollableRef.current.scrollTop)
    }

    if (meta && currentPage < meta.total_pages) {
      setScrollOfHeight((prev) => [...prev, Number(scrollableRef.current?.scrollTop)])
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
    const entry = Object.entries(typeOfBlockMessage).find(([key, value]) => value === blockType)
    return entry ? messageOfMessageBlock[entry[0] as keyof typeof messageOfMessageBlock] : undefined
  }

  useEffect(() => {
    if (!conversationInfo?.order_id || !conversationInfo?.worker_id || conversationInfo == null || network.online === false || documentVisible === false) return

    socket.emit(typeOfSocket.JOIN_CONVERSATION_ROOM, { workerId: conversationInfo?.worker_id, orderId: conversationInfo?.order_id })

    socket.on(typeOfSocket.MESSAGE_BLOCK, (data: any) => {
      setMessageBlock(getMessageByBlockType(data?.status as string) || '')
      setIsCancleOrder(true)
    })

    socket.on(typeOfSocket.MESSAGE_SEEN, (data: any) => {
      // seen all message in conversation when user get message
      if (data.status === 'SEEN MESSAGE') {
        setConversation((prev) =>
          prev.map((message) => ({
            ...message,
            status: 'seen'
          }))
        )
      } else {
      }
    })

    socket.on(typeOfSocket.SEEN, (data: any) => {
      // setConversation((prevConversation) => prevConversation.map((msg) => (msg.id == data?.data?.messageId ? { ...msg, status: 'seen' } : msg)))
      setConversation((prev) =>
        prev.map((message) => ({
          ...message,
          status: 'seen'
        }))
      )
    })

    socket.on(typeOfSocket.MESSAGE_ARRIVE, (data: any) => {
      console.log({ data })
      if (data?.socket_id == socket?.id) {
      } else {
        setConversation((prevConversation) => [...prevConversation, data?.message])
        socket.emit(typeOfSocket.SEEN, { messageId: data?.message?.id, conversationId: conversationInfo?.conversation_id, orderId: conversationInfo?.order_id, workerId: conversationInfo?.worker_id })

        socket.emit(typeOfSocket.MESSAGE_SEEN, {
          workerId: conversationInfo?.worker_id,
          orderId: conversationInfo?.order_id,
          currentId,
          message_id: data?.message?.id,
          conversationId: conversationInfo?.conversation_id
        })
      }
    })

    return () => {
      socket.emit(typeOfSocket.LEAVE_CONVERSATION_ROOM, { workerId: conversationInfo?.worker_id, orderId: conversationInfo?.order_id })
      socket.off(typeOfSocket.MESSAGE_ARRIVE)
      socket.off(typeOfSocket.MESSAGE_SEEN)
      socket.off(typeOfSocket.SEEN)
      // socket.off(typeOfSocket.MESSAGE_BLOCK)
    }
  }, [conversationInfo, conversation, socket])

  useEffect(() => {
    if (documentVisible) {
      setOnReloadMessage(true)

      const handleVisibilityChange = () => {
        socket?.emit(typeOfSocket.JOIN_CONVERSATION_ROOM, { workerId: conversationInfo?.worker_id, orderId: conversationInfo?.order_id })
      }

      handleVisibilityChange()
    }
  }, [documentVisible, network])

  useEffect(() => {
    if (onFetchingMessage) return
    onReloadMessage && handleGetMessage()
  }, [onReloadMessage, handleGetMessage, onFetchingMessage])

  return (
    <div className={`relative flex h-dvh flex-col`}>
      <Suspense fallback={null}>
        <Header workerId={Number(conversationInfo?.worker_id)} conversationInfo={conversationInfo} />
      </Suspense>
      <Suspense fallback={null}>
        {onFetchingMessage ? (
          <ConverstaionsSkeleton />
        ) : (
          <div
            id='scrollableDiv'
            ref={scrollableRef}
            style={{
              height: '100%',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column-reverse'
            }}
          >
            <InfiniteScroll
              dataLength={conversation.length}
              next={loadMoreMessages}
              style={{ display: 'flex', flexDirection: 'column-reverse' }}
              inverse={true}
              hasMore={meta ? currentPage < meta.total_pages : false}
              loader={
                <div className='flex w-full items-center justify-center py-2'>
                  <CircularProgress
                    size='md'
                    classNames={{
                      svg: 'h-6 w-6 text-primary-blue'
                    }}
                  />
                </div>
              }
              scrollableTarget='scrollableDiv'
            >
              <Conversation meta={meta} conversation={groupedMessages} conversationInfo={conversationInfo} isSendingMessage={isSendingMessage} />
            </InfiniteScroll>
          </div>
        )}
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
