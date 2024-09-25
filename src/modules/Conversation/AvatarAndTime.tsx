import ImageCustom from '@/components/ImageCustom'
import { memo } from 'react'

const AvatarAndTime = ({ time, isMe }: { time: string; isMe: boolean }) => {
  return (
    <div className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
      <ImageCustom height={40} width={40} className='size-10 w-auto object-cover' src={'/AI.png'} />
      <time className='text-xs text-primary-gray'>{time}</time>
    </div>
  )
}

export default memo(AvatarAndTime)
