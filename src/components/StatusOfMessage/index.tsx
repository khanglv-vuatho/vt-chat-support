import { translate } from '@/context/translationProvider'
import React, { FC, memo } from 'react'
import ImageCustom from '../ImageCustom'
import { Avatar } from '@nextui-org/react'
import { TConversationInfo } from '@/types'

interface StatusOfMessageProps {
  status: 'pending' | 'sent' | 'failed' | 'seen'
  conversationInfo: TConversationInfo | null
  display?: boolean
}

const StatusOfMessage: FC<StatusOfMessageProps> = ({ status, conversationInfo, display = true }) => {
  const t = translate('StatsusText')
  if (conversationInfo === null) return null
  let textStatus: React.ReactNode
  const queryParams = new URLSearchParams(location.search)
  const user_id = Number(queryParams.get('user_id'))
  const isCMS = !!user_id
  const avatar = isCMS ? conversationInfo?.user_picture : './AI.png'

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
        <Avatar src={isCMS ? avatar : './AI.png'} className={`size-4 max-h-4 max-w-4 rounded-full object-cover ${!!display ? 'opacity-100' : 'hidden'}`} />
      )
      break
    default:
      break
  }

  return <>{textStatus}</>
}

export default memo(StatusOfMessage)
