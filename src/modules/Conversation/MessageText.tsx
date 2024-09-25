import { isStringWithoutEmoji } from '@/utils'
import { motion } from 'framer-motion'
import { memo } from 'react'

const MessageText = ({ item, isMe, onClick }: { item: any; isMe: boolean; onClick: (id: string) => void }) => {
  const isEmoji = !isStringWithoutEmoji(item?.content) && item?.content.length === 2

  const messageAnimation = {
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

  return (
    <motion.div
      variants={item?.status === 'pending' ? messageAnimation : { initial: { x: 0, y: 0 } }}
      initial='initial'
      animate='animate'
      transition={{ duration: 0.2 }}
      viewport={{ once: true }}
      className={`max-w-[80%] ${isEmoji ? 'my-2 p-2 px-3' : `rounded-lg border-1 p-2 px-3 ${isMe ? 'border-transparent bg-[#728dd01a]' : 'border-primary-gray/20 bg-transparent'}`}`}
      onClick={() => onClick(item?.id)}
    >
      <pre className={`font-inter break-words text-base ${isEmoji ? 'scale-[2.5]' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
        {item?.content}
      </pre>
    </motion.div>
  )
}

export default memo(MessageText)
