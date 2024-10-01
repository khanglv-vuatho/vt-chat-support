import { motion } from 'framer-motion'
import { Add, Call, Refresh } from 'iconsax-react'
import { memo, useCallback, useEffect, useState } from 'react'

import { fetchingDetailOrder } from '@/apis'
import { ButtonOnlyIcon } from '@/components/Buttons'
import { keyPossmessage, typeOfSocket } from '@/constants'
import { useSocket } from '@/context/SocketProvider'
import { translate } from '@/context/translationProvider'
import instance from '@/services/axiosConfig'
import { TConversationInfo, TOrderDetail } from '@/types'
import { postMessageCustom } from '@/utils'
import OrderDetailHeader from './OrderDetailHeader'

type THeaderProps = {
  workerId: number
  conversationInfo: TConversationInfo | null
}

const Header: React.FC<THeaderProps> = ({ workerId, conversationInfo }) => {
  const h = translate('Header')
  const socket: any = useSocket()
  const queryParams = new URLSearchParams(location.search)
  const orderId = queryParams.get('orderId')
  const [orderDetail, setOrderDetail] = useState<TOrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const worker_id = Number(queryParams.get('worker_id'))
  const isClient = !!worker_id

  const handleCloseWebview = useCallback(async () => {
    await socket.emit(typeOfSocket.LEAVE_CONVERSATION_ROOM, { workerId: conversationInfo?.worker_id, orderId: conversationInfo?.order_id })

    postMessageCustom({
      message: keyPossmessage.CAN_POP
    })
  }, [conversationInfo])

  const handleFetchingDetail = async () => {
    const result = await fetchingDetailOrder({ orderId: Number(orderId), worker_id: workerId })
    setOrderDetail(result)
    setIsLoading(false)
  }

  // postmessage to app for call
  const handleCall = () => {
    const keyPhone = isClient ? 'worker_phone' : 'client_phone'
    const phoneCode = orderDetail?.[keyPhone]?.phone?.phone_code || ''
    const phoneNumber = orderDetail?.[keyPhone]?.phone?.phone_number || ''

    postMessageCustom({
      message: keyPossmessage?.CALL,
      data: {
        phoneCode,
        phoneNumber
      }
    })
  }
  const handleClearMessage = async () => {
    const payload = {
      worker_id: 429
    }
    await instance.post(`/webview/conversations/${orderId}/clear-message`, payload)
  }

  useEffect(() => {
    setIsLoading(true)
  }, [workerId])

  useEffect(() => {
    isLoading && !!workerId && handleFetchingDetail()
  }, [isLoading, workerId])

  return (
    <motion.header initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className='sticky left-0 right-0 top-0 z-50 mb-2 flex flex-col bg-white'>
      <div className='flex items-center justify-between border-b-2 border-[#E4E4E4] px-4 py-2'>
        <div className='flex items-center font-bold'>
          <ButtonOnlyIcon className='' onClick={handleCloseWebview}>
            <Add className='rotate-45' size={32} />
          </ButtonOnlyIcon>
          <p className='text-sm'>{h?.title}</p>
        </div>
        {orderDetail?.status !== 0 && (
          <div className='flex gap-2'>
            {isLoading ? (
              ''
            ) : (
              <ButtonOnlyIcon className={`${isClient ? 'bg-primary-yellow' : 'bg-primary-blue'} text-white`} onClick={handleCall}>
                <Call size={24} variant='Bold' />
              </ButtonOnlyIcon>
            )}
          </div>
        )}
        {import.meta.env.VITE_TEST === 'test' && (
          <ButtonOnlyIcon onClick={handleClearMessage} className='bg-primary-yellow text-white'>
            <Refresh size={24} variant='Bold' />
          </ButtonOnlyIcon>
        )}
      </div>
      <OrderDetailHeader orderDetail={orderDetail} />
    </motion.header>
  )
}

export default memo(Header)
