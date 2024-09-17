import { postMessageCustom } from '@/utils'
import { Button, ButtonProps } from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'

type Props = {
  className?: string
  isDisabled?: boolean
  isLoading?: boolean
} & Omit<ButtonProps, 'onPress'>

type Frequency = 'low' | 'medium' | 'high'

const handlePhoneVibration = (frequency: Frequency = 'low') => {
  postMessageCustom({ message: `vibrate-${frequency}` })
}

export function getRadiusClass(classString: string) {
  // Sử dụng regex để tìm và lấy ra giá trị của `radius-*`
  const match = classString.match(/rounded-[^\s]+/)
  return match ? match[0] : null
}

export const PrimaryButton = ({ className, isLoading, isDisabled, children, ...props }: Props) => {
  const radiusClass = getRadiusClass(className || '')
  return (
    <div className='relative z-50 w-full'>
      <Button
        {...props}
        className={twMerge(
          `data-[pressed=true]:scale-1 z-50 w-full select-none ${radiusClass} [focus-visible=true]:outline-offset-0 bg-primary-yellow font-bold text-white outline-none data-[pressed=true]:translate-y-1 data-[hover=true]:opacity-100 data-[focus-visible=true]:outline-none ${isLoading ? 'translate-y-1' : ''} ${isDisabled ? 'cursor-not-allowed' : ''}`,
          className
        )}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onClick={(e) => {
          handlePhoneVibration()
          props?.onClick?.(e)
        }}
      >
        {children}
      </Button>
      <div className={`absolute inset-0 z-[10] translate-y-1 bg-[#C69306] ${radiusClass} ${isDisabled ? '' : ''}`} />
    </div>
  )
}
export const PrimaryOutlineButton = ({ className, isDisabled, isLoading, children, ...props }: Props) => {
  const radiusClass = getRadiusClass(className || '')

  return (
    <div className='relative z-50 w-full'>
      <Button
        {...props}
        className={twMerge(
          `data-[pressed=true]:scale-1 [focus-visible=true]:outline-offset-0 z-50 w-full select-none outline-none data-[focus-visible=true]:outline-none ${radiusClass} border border-primary-yellow bg-white font-bold text-primary-yellow data-[pressed=true]:translate-y-1 data-[hover=true]:opacity-100 ${isLoading ? 'translate-y-1' : ''}`,
          className
        )}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onClick={(e) => {
          handlePhoneVibration()
          props?.onClick?.(e)
        }}
      >
        {children}
      </Button>
      <div className={`absolute inset-0 z-[-10] translate-y-1 ${radiusClass} ${isDisabled ? '' : 'bg-primary-yellow/80'}`} />
    </div>
  )
}

export const PrimaryLightButton = ({ className, children, ...props }: Props) => {
  const radiusClass = getRadiusClass(className || '')

  return (
    <Button
      {...props}
      onClick={(e) => {
        handlePhoneVibration()
        props?.onClick?.(e)
      }}
      className={twMerge(
        `${radiusClass} [focus-visible=true]:outline-offset-0 select-none bg-primary-light-blue font-bold text-primary-blue outline-none data-[focus-visible=true]:outline-none`,
        className
      )}
    >
      {children}
    </Button>
  )
}

export const ButtonOnlyIcon = ({ className, children, ...props }: Props) => {
  return (
    <Button
      {...props}
      isIconOnly
      onClick={(e) => {
        handlePhoneVibration()
        props?.onClick?.(e)
      }}
      className={twMerge('w-fit rounded-full bg-transparent outline-none data-[focus-visible=true]:outline-none data-[focus-visible=true]:outline-offset-0', className)}
    >
      {children}
    </Button>
  )
}
