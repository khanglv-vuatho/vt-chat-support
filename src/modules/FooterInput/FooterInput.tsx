import { ButtonOnlyIcon } from '@/components/Buttons'
import { typeOfSocket } from '@/constants'
import { useSocket } from '@/context/SocketProvider'
import { translate } from '@/context/translationProvider'
import { MessageProps, TConversationInfo, THandleSendMessage } from '@/types'
import { Button, Textarea } from '@nextui-org/react'
import { AnimatePresence, motion } from 'framer-motion'
import { DocumentUpload, Send2 } from 'iconsax-react'
import { memo, useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSound from 'use-sound'
import sendSound from '../../../public/sendMessage.mp4'
import { isMobileWithUserAgent } from '@/utils'

type FooterInputProps = {
  handleSendMessage: ({ message }: THandleSendMessage) => Promise<void>
  conversationInfo: TConversationInfo | null
  isSendingMessage: boolean
  onFetchingMessage: boolean
  onReloadMessage: boolean
}

const FooterInput: React.FC<FooterInputProps> = ({ handleSendMessage, conversationInfo, isSendingMessage, onFetchingMessage, onReloadMessage }) => {
  const f = translate('Footer')

  const sendRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const uploadRef = useRef<HTMLInputElement | any>(null)
  const socket: any = useSocket()

  const queryParams = new URLSearchParams(location.search)
  const user_id = Number(queryParams.get('user_id'))
  const isCMS = !!user_id
  //sound
  const [play] = useSound(sendSound)

  const { control, handleSubmit, reset } = useForm<MessageProps & { files: File[] }>({
    defaultValues: {
      message: '',
      files: []
    }
  })

  const handleSend = async (data: MessageProps) => {
    reset({ message: '' })
    play()
    await handleSendMessage({ message: data.message.trim() === '' ? '👍' : data.message.trim() })
  }

  useEffect(() => {
    const inputEl: any = inputRef.current

    const handleBlur = (e: any) => {
      console.log(e.relatedTarget.id)
      if (sendRef?.current?.contains(e?.relatedTarget) || e?.relatedTarget?.name === 'upload-file-button' || e?.relatedTarget?.id === 'scroll-to-bottom') {
        if (e?.relatedTarget?.name === 'upload-file-button') {
          handleClickInputFile(e)
        }
        inputEl?.focus()
        inputEl.value = ''
      } else {
        socket.emit(typeOfSocket.MESSAGE_TYPING_CMS, {
          socket_id: socket.id,
          message: '',
          order_id: conversationInfo?.order_id,
          current_id: conversationInfo?.current_id,
          user_id: conversationInfo?.user_id
        })
        inputEl?.blur()
      }
    }

    inputEl?.addEventListener('blur', handleBlur)

    return () => {
      inputEl?.removeEventListener('blur', handleBlur)
    }
  }, [])

  const handleClickInputFile = (e: any) => {
    e.preventDefault()
    if (uploadRef.current) {
      uploadRef.current.click()
    }
  }

  return (
    <motion.footer initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className='sticky bottom-0 left-0 right-0 z-50 flex flex-col gap-2'>
      <form className='w-full'>
        <Controller
          name='message'
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              onBlur={() =>
                socket.emit(typeOfSocket.MESSAGE_TYPING_CMS, {
                  socket_id: socket.id,
                  message: '',
                  order_id: conversationInfo?.order_id,
                  current_id: conversationInfo?.current_id,
                  user_id: conversationInfo?.user_id
                })
              }
              onChange={(e) => {
                field.onChange(e.target.value)
                if (e.target.value.length === 1) {
                  socket.emit(typeOfSocket.MESSAGE_TYPING_CMS, {
                    socket_id: socket.id,
                    message: e.target.value,
                    order_id: conversationInfo?.order_id,
                    current_id: conversationInfo?.current_id,
                    user_id: conversationInfo?.user_id
                  })
                }
              }}
              ref={inputRef}
              minRows={1}
              maxRows={3}
              autoFocus
              maxLength={isCMS ? 1000 : 300}
              radius='none'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
              placeholder={f?.text1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isMobileWithUserAgent()) {
                  if (field.value.trim() === '') return
                  e.preventDefault()
                  handleSubmit(handleSend)()
                }
              }}
              endContent={
                <div className='flex items-center gap-2'>
                  <Controller
                    name='files'
                    control={control}
                    render={({ field: { onChange } }) => (
                      <>
                        <input
                          type='file'
                          accept='image/*'
                          style={{
                            display: 'none'
                          }}
                          ref={uploadRef}
                          onChange={async (e) => {
                            onChange(e.target.files)

                            if (e?.target?.files && e?.target?.files?.length > 0) {
                              await handleSendMessage({ message: '', attachment: e.target.files[0], type: 1 })
                              if (!socket.connected) {
                                console.log('Socket bị ngắt kết nối, đang kết nối lại...')
                                socket.connect() // Thực hiện kết nối lại
                              }
                            }
                            e.target.value = ''
                          }}
                        />
                        <ButtonOnlyIcon name='upload-file-button' onClick={handleClickInputFile}>
                          <DocumentUpload variant='Bold' className={isCMS ? 'text-primary-yellow' : 'text-primary-blue'} />
                        </ButtonOnlyIcon>
                      </>
                    )}
                  />
                  {field.value.trim() === '' ? (
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} exit={{ opacity: 0, scale: 0 }}>
                        {/* khang */}
                        <Button
                          isDisabled={isSendingMessage}
                          ref={sendRef}
                          isIconOnly
                          radius='full'
                          className='flex items-center justify-center bg-transparent transition'
                          onClick={handleSubmit(handleSend)}
                        >
                          👍
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} exit={{ opacity: 0, scale: 0 }}>
                      <Button
                        ref={sendRef}
                        isDisabled={onFetchingMessage || onReloadMessage}
                        isIconOnly
                        radius='full'
                        className={`flex items-center justify-center bg-transparent ${isCMS ? 'text-primary-yellow' : 'text-primary-blue'} transition`}
                        onClick={handleSubmit(handleSend)}
                      >
                        <Send2 variant='Bold' className='rotate-45 transition' />
                      </Button>
                    </motion.div>
                  )}
                </div>
              }
              classNames={{
                base: 'px-4 border-t-1 border-[#E4E4E4] bg-white',
                innerWrapper: 'items-end',
                input: 'text-primary-base placeholder:pl-1 pb-1 caret-primary-green placeholder:text-primary-gray placeholder:text-sm text-base',
                inputWrapper:
                  'p-1 !min-h-14 border-none bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus-visible=true]:ring-0 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-0 group-data-[focus-visible=true]:ring-offset-background shadow-none'
              }}
            />
          )}
        />
      </form>
    </motion.footer>
  )
}

export default memo(FooterInput)
