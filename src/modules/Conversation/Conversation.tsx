import ImageCustom from '@/components/ImageCustom'
import { typeOfMessage, typeOfSocket } from '@/constants'
import { useSocket } from '@/context/SocketProvider'
import { translate } from '@/context/translationProvider'
import { MessageGroup, TConversationInfo, TInfoTyping } from '@/types'
import { formatLocalHoursTime, isStringWithoutEmoji } from '@/utils'
import { Avatar } from '@nextui-org/react'
import { motion } from 'framer-motion'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import useSound from 'use-sound'
import typingSound from '../../../public/typingSound.mp4'
import MessageImage from './MessageImage'
import StatusOfMessage from '@/components/StatusOfMessage'

type ConversationProps = {
  conversation: MessageGroup[]
  conversationInfo: TConversationInfo | null
}

const Conversation: React.FC<ConversationProps> = ({ conversation, conversationInfo }) => {
  const socket: any = useSocket()
  const t = translate('StatsusText')

  const queryParams = new URLSearchParams(location.search)
  const currentId: any = Number(queryParams.get('currentId'))
  const worker_id = Number(queryParams.get('worker_id'))
  const isClient = !!worker_id

  const [infoTyping, setInfoTyping] = useState<TInfoTyping | null>(null)
  //store current message id when user click message
  const [currentMessage, setCurrentMessage] = useState<number>(0)

  const lastElementRef = useRef<HTMLDivElement>(null)
  const fristElementRef = useRef<HTMLDivElement>(null)

  const conversationClone = [...conversation]
  const conversationCloneReverse = [...conversationClone].reverse()

  const lastGroupInConversatioReverse = conversationCloneReverse?.[conversationCloneReverse?.length - 1]
  const lastMessageInLastGroupConversatioReverse = lastGroupInConversatioReverse?.messages?.[lastGroupInConversatioReverse?.messages?.length - 1]
  const [play] = useSound(typingSound)

  const isAnotherUserTyping = infoTyping?.user_id === currentId

  const messageAnimation = useCallback(() => {
    return {
      initial: { x: -80, y: 20 },
      animate: {
        x: 0,
        y: 0,
        transition: {
          x: { delay: 0.05, type: 'tween', duration: 0.05 },
          y: { duration: 0.1 }
        }
      }
    }
  }, [])

  const shouldRenderTextStatus = useCallback(
    (status: 'pending' | 'sent' | 'failed' | 'seen', display: boolean = true): React.ReactNode => {
      if (conversationInfo === null) return null
      let textStatus
      const avatar = isClient ? conversationInfo?.worker_picture : conversationInfo?.client_picture

      switch (status) {
        case 'pending':
          textStatus = <p className='text-xs text-primary-gray'>{t?.sending}</p>
          break
        case 'sent':
          textStatus = <p className='text-xs text-primary-gray'>{t?.sent}</p>
          break
        case 'failed':
          textStatus = <p className='text-xs text-primary-gray'>{t?.failed}</p>
          break
        case 'seen':
          textStatus = <ImageCustom src={avatar} alt={avatar} className={`size-4 max-h-4 max-w-4 rounded-full object-cover ${!!display ? 'opacity-100' : 'hidden'}`} />
          break

        default:
          break
      }

      return textStatus
    },

    [conversationInfo]
  )

  useEffect(() => {
    socket.on(typeOfSocket.MESSAGE_TYPING, (data: TInfoTyping) => {
      if (socket.id === data?.socket_id) return
      setInfoTyping(data)
    })
    return () => {
      socket.off(typeOfSocket.MESSAGE_TYPING)
    }
  }, [])

  useEffect(() => {
    let timer: any

    socket.on(typeOfSocket.MESSAGE_TYPING, (data: TInfoTyping) => {
      if (socket?.id === data?.socket_id) return
      setInfoTyping(data)

      // Xóa timer cũ trước khi đặt timer mới
      clearTimeout(timer)
      timer = setTimeout(() => {
        setInfoTyping(null)
      }, 7000)
    })

    return () => {
      clearTimeout(timer)
      socket.off(typeOfSocket.MESSAGE_TYPING)
    }
  }, [])

  const handleClickMessage = useCallback((id: number | null) => {
    console.log({ id })
    if (!id) return
    setCurrentMessage((prev) => (prev === id ? 0 : id))
  }, [])

  useEffect(() => {
    if (isAnotherUserTyping && infoTyping?.is_typing) {
      play()
    }
  }, [infoTyping])

  // show status when last message in last group
  const handleCheckConditionsToShowStatsus = (id: number) => {
    return lastMessageInLastGroupConversatioReverse?.id === id
  }

  // show status when last message in last group is seen
  const handleGetLastMessageInLastGroup = (id: number) => {
    if (conversationCloneReverse?.length === 0 || !id) return { isCanShow: false, lastSeenMessage: null }
    const allMessages = conversationCloneReverse?.flatMap((group) => group?.messages)

    const lastMessage = allMessages?.[allMessages?.length - 1]

    // Filter out messages that have been seen
    const seenMessages = allMessages.filter((message) => message.status === 'seen')

    // Get the last message that has been seen
    const lastSeenMessage = seenMessages?.[seenMessages?.length - 1]

    if (lastSeenMessage?.id === lastMessage?.id) return { isCanShow: false, lastSeenMessage, lastMessage }

    return { isCanShow: seenMessages?.length > 0 ? lastSeenMessage?.id === id : false, lastSeenMessage, lastMessage }
  }

  return (
    <>
      {infoTyping?.is_typing && (
        <motion.div
          className={`-mt-1 flex min-h-10 w-fit items-center gap-1 rounded-lg border-1 px-2 ${isAnotherUserTyping ? 'border-transparent bg-primary-light-blue' : 'border-primary-yellow bg-transparent'}`}
        >
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                className='h-1.5 w-1.5 rounded-full bg-primary-black/40'
                animate={{
                  y: [0, -4, 0],
                  transition: {
                    delay: index * 0.1,
                    duration: 0.3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 1
                  }
                }}
              />
            ))}
        </motion.div>
      )}
      {conversation?.map((message, index) => {
        // last item in conversation, but has received array conversation so need to get isFirstItemInConversation
        const isMe = message?.userId === currentId
        const isLastMessageInGroup = message?.messages?.length === 1
        return (
          <div key={`message-${message?.userId}-${index}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
            <div className='flex w-full flex-col gap-3'>
              {!isMe && (
                <div className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                  <Avatar size='sm' src={message?.messages?.[0]?.by?.profile_picture} />
                  <time className='text-xs text-primary-gray'>{formatLocalHoursTime(message?.messages?.[0]?.created_at)}</time>
                </div>
              )}
              <div className={`flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'} `}>
                {message?.messages?.map((item, indexGroup) => {
                  const isEmoji = !isStringWithoutEmoji(item?.content) && item?.content.length === 2
                  const isActiveMessage = currentMessage === item?.id && indexGroup !== 0
                  const isShowStatsus = handleCheckConditionsToShowStatsus(item?.id)
                  const { isCanShow } = handleGetLastMessageInLastGroup(item?.id)

                  return (
                    <div key={item?.id} className={`flex w-full flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {isActiveMessage && (
                        <motion.p
                          key={item?.created_at}
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: 'easeInOut',
                            delay: 0.1
                          }}
                          className='w-full origin-top overflow-hidden py-2 text-center text-xs text-primary-gray'
                        >
                          {formatLocalHoursTime(item?.created_at)}
                        </motion.p>
                      )}
                      <div ref={conversation.length === index + 1 ? lastElementRef : undefined} key={`message-${item?.id}`} className='flex w-full items-end justify-between'>
                        <div ref={indexGroup === 0 && index === 0 ? fristElementRef : undefined} className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'} gap-0.5`}>
                          {Number(item?.type) === typeOfMessage.TEXT ? (
                            <motion.div
                              variants={item?.status === 'pending' ? messageAnimation() : { initial: { x: 0, y: 0 } }}
                              initial='initial'
                              animate='animate'
                              transition={{ duration: 0.2 }}
                              viewport={{ once: true }}
                              className={`max-w-[80%] ${
                                isEmoji ? 'my-2 p-2 px-3' : `rounded-lg border-1 p-2 px-3 ${isMe ? 'border-transparent bg-primary-light-blue' : 'border-primary-yellow bg-transparent'}`
                              }`}
                              onClick={() => handleClickMessage(item?.id)}
                            >
                              <pre className={`font-inter break-words text-base ${isEmoji ? 'scale-[2.5]' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                                {item?.content}
                              </pre>
                            </motion.div>
                          ) : (
                            <MessageImage key={`message-${item?.attachments?.[0]?.url}`} url={item?.attachments?.[0]?.url as string} />
                          )}
                        </div>
                      </div>

                      {isMe && (isShowStatsus || isCanShow) && <StatusOfMessage status={item?.status} conversationInfo={conversationInfo} isClient={isClient} />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default memo(Conversation)
