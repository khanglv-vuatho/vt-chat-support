'use client'

import { Image, ImageProps } from '@nextui-org/react'
import { forwardRef, Ref } from 'react'
import { twMerge } from 'tailwind-merge'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageCustomProps extends ImageProps {
  fallback?: string
  animate?: boolean
}

const ImageCustom = forwardRef(({ src, alt, className, animate = false, ...props }: ImageCustomProps, ref: Ref<HTMLImageElement>) => {
  const imageComponent = <Image width={400} height={400} removeWrapper className={twMerge('pointer-events-none select-none rounded-none', className)} ref={ref} src={src} alt={alt} {...props} />

  if (animate) {
    return (
      <AnimatePresence>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.1 }}>
          {imageComponent}
        </motion.div>
      </AnimatePresence>
    )
  }

  return imageComponent
})

export default ImageCustom
