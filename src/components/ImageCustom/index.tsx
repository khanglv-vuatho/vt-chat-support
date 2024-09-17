'use client'

import { Image, ImageProps } from '@nextui-org/react'
import { forwardRef, Ref } from 'react'
import { twMerge } from 'tailwind-merge'

interface ImageCustomProps extends ImageProps {
  fallback?: string
}

const ImageCustom = forwardRef(({ src, alt, className, ...props }: ImageCustomProps, ref: Ref<HTMLImageElement>) => {
  return <Image width={400} height={400} removeWrapper className={twMerge('pointer-events-none select-none rounded-none', className)} ref={ref} src={src} alt={alt} {...props} />
})

export default ImageCustom
