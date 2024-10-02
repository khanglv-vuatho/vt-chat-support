import { translate } from '@/context/translationProvider'
import React, { FC, memo } from 'react'
import ImageCustom from '../ImageCustom'
import { Avatar } from '@nextui-org/react'

interface StatusOfMessageProps {
  status: 'pending' | 'sent' | 'failed' | 'seen'
  conversationInfo: {
    worker_picture: string
    client_picture: string
  } | null
  isClient: boolean
  display?: boolean
}

const StatusOfMessage: FC<StatusOfMessageProps> = ({ status, conversationInfo, isClient, display = true }) => {
  const t = translate('StatsusText')

  if (conversationInfo === null) return null

  let textStatus: React.ReactNode
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
      textStatus = !!avatar ? (
        <ImageCustom src={avatar} alt={avatar} className={`size-4 max-h-4 max-w-4 rounded-full object-cover ${!!display ? 'opacity-100' : 'hidden'}`} />
      ) : (
        <Avatar src={avatar} className={`size-4 max-h-4 max-w-4 rounded-full object-cover ${!!display ? 'opacity-100' : 'hidden'}`} />
      )
      break
    default:
      break
  }

  return <>{textStatus}</>
}

export default memo(StatusOfMessage)
