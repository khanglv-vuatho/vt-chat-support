import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, useCallback, useState, useEffect } from 'react'
import { ButtonOnlyIcon } from '../Buttons'
import { ArrowDown } from 'iconsax-react'
import { Badge } from '@nextui-org/react'

type TScrollToBottom = {
  showScrollToBottom: boolean
}

const ScrollToBottom: React.FC<TScrollToBottom> = ({ showScrollToBottom }) => {
  const [isScrolling, setIsScrolling] = useState(false)

  const handleScrollToBottom = useCallback(() => {
    const scrollableDiv = document.getElementById('scrollableDiv')
    if (scrollableDiv) {
      setIsScrolling(true)
      const start = scrollableDiv.scrollTop
      const end = scrollableDiv.scrollHeight - scrollableDiv.clientHeight
      const duration = 300 // Adjust this value to control the speed (lower = faster)
      const startTime = performance.now()

      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.min(elapsedTime / duration, 1)
        const easeInOutCubic = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

        scrollableDiv.scrollTop = start + (end - start) * easeInOutCubic

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        } else {
          setIsScrolling(false)
        }
      }

      requestAnimationFrame(animateScroll)
    }
  }, [])

  useEffect(() => {
    if (isScrolling) {
      const timer = setTimeout(() => setIsScrolling(false), 300) // Match this with the duration of the scroll animation
      return () => clearTimeout(timer)
    }
  }, [isScrolling])

  return (
    <AnimatePresence>
      {showScrollToBottom && !isScrolling && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className='absolute bottom-20 left-1/2 z-[100] -translate-x-1/2'
        >
          {/* <Badge content='5' size='sm' className='bg-transparent text-red-500'> */}
          <ButtonOnlyIcon
            onClick={handleScrollToBottom}
            className={`flex size-8 max-h-8 min-h-8 min-w-8 max-w-8 flex-shrink-0 rounded-full bg-white p-2 text-primary-black shadow-lg transition-all duration-300`}
          >
            <ArrowDown className='size-4' />
          </ButtonOnlyIcon>
          {/* </Badge> */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(ScrollToBottom)
