import { twMerge } from 'tailwind-merge'

const WrapperBottom = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={twMerge('fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 bg-white px-8 pb-6 pt-4', className)}>{children}</div>
}

export default WrapperBottom
