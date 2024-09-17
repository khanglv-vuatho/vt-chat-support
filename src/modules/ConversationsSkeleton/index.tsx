import { Skeleton } from '@nextui-org/react'
import { memo } from 'react'

const ConverstaionsSkeleton = () => {
  return (
    <div className='flex h-full flex-col gap-2 px-4'>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonConversation key={index} index={index} />
      ))}
    </div>
  )
}

const SkeletonConversation = memo(({ index }: { index: number }) => {
  const randomHeight = Math.floor(Math.random() * (200 - 40 + 1)) + 100
  const heightStyle = index % 2 === 0 ? '40px' : `${randomHeight}px`

  return (
    <div className='flex w-full items-center justify-end gap-2' style={{ height: heightStyle, justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start' }}>
      <Skeleton className='flex h-full w-full max-w-[80%] rounded-lg' />
    </div>
  )
})

export default memo(ConverstaionsSkeleton)
