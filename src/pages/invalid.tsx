import { PrimaryOutlineButton } from '@/components/Buttons'
import ImageCustom from '@/components/ImageCustom'

const InvalidPage = () => {
  return (
    <div className='flex h-dvh items-center justify-center bg-primary-light-blue px-8'>
      <div className='flex w-full flex-col items-center gap-4 rounded-2xl bg-white p-4 shadow-[8px_8px_16px_0px_#0000000A]'>
        <div className='h-[122px] w-[132px]'>
          <ImageCustom src='/invalid.png' height={400} width={400} className='size-full' />
        </div>
        <p className='text-sm'>Trình duyệt của bạn không được hỗ trợ</p>
        <PrimaryOutlineButton className='w-full rounded-full'>Quay về App</PrimaryOutlineButton>
      </div>
    </div>
  )
}

export default InvalidPage
