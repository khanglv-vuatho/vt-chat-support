import { motion } from 'framer-motion'
import { Add, ArrowLeft, ArrowLeft2 } from 'iconsax-react'
import { memo, useCallback } from 'react'

import { ButtonOnlyIcon } from '@/components/Buttons'
import { keyPossmessage, typeOfSocket } from '@/constants'
import { useSocket } from '@/context/SocketProvider'
import { translate } from '@/context/translationProvider'
import { TConversationInfo } from '@/types'
import { postMessageCustom } from '@/utils'

type THeaderProps = {
  conversationInfo: TConversationInfo | null
}

const Header: React.FC<THeaderProps> = ({ conversationInfo }) => {
  const h = translate('Header')
  const socket: any = useSocket()

  const handleCloseWebview = useCallback(async () => {
    await socket.emit(typeOfSocket.LEAVE_CONVERSATION_ROOM, { workerId: conversationInfo?.worker_id, orderId: conversationInfo?.order_id })
    postMessageCustom({
      message: keyPossmessage.CAN_POP
    })
  }, [conversationInfo])

  return (
    <motion.header initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className='sticky left-0 right-0 top-0 z-50 mb-2 flex flex-col bg-white'>
      <div className='flex items-center justify-between border-b-2 border-[#E4E4E4] p-2'>
        <div className='flex items-center font-bold'>
          <ButtonOnlyIcon onClick={handleCloseWebview}>
            <ArrowLeft2 size={24} />
          </ButtonOnlyIcon>
          <p className='text-sm'>{h?.title}</p>
        </div>
      </div>
    </motion.header>
  )
}

export default memo(Header)