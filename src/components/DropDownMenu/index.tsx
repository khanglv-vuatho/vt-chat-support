import { AnimatePresence, motion } from 'framer-motion'
import { memo, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  isOpen: boolean
  children: React.ReactNode
  direction?: 'left' | 'top' | 'right'
  className?: string | undefined
}

const DropDownMenu: React.FC<Props> = ({ isOpen, children, className, direction = 'top' }) => {
  const menuVariants = {
    initial: direction === 'left' || direction === 'right' ? { scaleX: 0 } : { scaleY: 0 },
    animate: direction === 'left' || direction === 'right' ? { scaleX: 1 } : { scaleY: 1 },
    exit: direction === 'left' || direction === 'right' ? { scaleX: 0, opacity: 0 } : { scaleY: 0, opacity: 0 }
  }

  const origin = { top: 'origin-top', left: 'origin-left', right: 'origin-right' }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial='initial'
          animate='animate'
          exit='exit'
          variants={menuVariants}
          className={twMerge(
            `3xl:top-[80px] 3xl:h-[calc(100dvh-80px)] fixed bottom-0 left-0 right-0 top-[70px] z-[1000] flex h-[calc(100dvh-70px)] flex-col items-start gap-4 overflow-hidden p-2 ${origin[direction]}`,
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(DropDownMenu)
