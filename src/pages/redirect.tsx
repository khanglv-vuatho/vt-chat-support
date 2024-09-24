import { DefaultModal } from '@/components/Modal'
import { handleAddLangInUrl } from '@/utils'
import { Button } from '@nextui-org/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Redirect = () => {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()

  const handleRedirectWorker = () => {
    navigate(
      handleAddLangInUrl({
        lang: 'vi',
        mainUrl: '/chat?currentId=429&orderId=3861',
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDI5LCJmdWxsX25hbWUiOiJLSE9JIExFRSIsInByb2ZpbGVfcGljdHVyZSI6Imh0dHBzOi8vY2RuLXNhbmRib3gudnVhdGhvLmNvbS9pbWFnZS9hZGJmNTljZC1jOTM1LTRhYTMtYjI0Zi00YjczYjczZDUzYjVfMTcyMTAyOTAxMDkxMC5wbmciLCJyZWZfaWQiOm51bGwsImt5Y19zdGF0dXMiOjIsIndvcmtlcl9zdGF0dXMiOjIsInNlc3Npb25fbG9naW5zIjpbeyJJUCI6IjExMy4xNjEuOTAuMjIyIiwiZGV2aWNlIjoiMTcyNjgwNDI5ODg2MCIsInRpbWUiOjE3MjY4MDQyOTg4NjB9XSwiaWF0IjoxNzI2ODA0Mjk4fQ.J02k2jDvSfMaxr1dcTULqqgxb7FR64qVP_CEx2vKAcA'
      })
    )
  }
  const handleRedirectWClient = () => {
    navigate(
      handleAddLangInUrl({
        lang: 'vi',
        mainUrl: '/chat?currentId=570&orderId=3861&worker_id=429',
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTcwLCJmdWxsX25hbWUiOiJsZWhhZ2lha2hvaSIsInByb2ZpbGVfcGljdHVyZSI6Imh0dHBzOi8vY2RuLTEudnVhdGhvLmNvbS9pbWFnZS8wYmI2NTVjZC02NWY1LTRiMWMtOTFhMC02NDZkZDk2ZTNkNmVfMTcyMTE4NTAwOTU5Ny5qcGciLCJyZWZfaWQiOm51bGwsImt5Y19zdGF0dXMiOjIsIndvcmtlcl9zdGF0dXMiOjIsInNlc3Npb25fbG9naW5zIjpbeyJJUCI6IjE5Mi4xNjguMC43NyIsImRldmljZSI6IjE3MjY3MzM0MzAxMjYiLCJ0aW1lIjoxNzI2NzMzNDMwMTI2fV0sImlhdCI6MTcyNjczMzQzMH0.34zgMZoVIRIGI6gB1gBgNisEGZapnsa5-b2m4ZYHTrs'
      })
    )
  }

  const handleRedirect = (role: string) => {
    setIsOpen(false)
    role == 'client' ? handleRedirectWClient() : handleRedirectWorker()
  }

  return (
    <div className='h-dvh'>
      <DefaultModal isOpen={isOpen} onOpenChange={() => {}}>
        <Button onClick={() => handleRedirect('client')} className='bg-primary-blue text-white'>
          Khách
        </Button>
        <Button onClick={() => handleRedirect('worker')} className='bg-primary-yellow text-white'>
          Thợ
        </Button>
      </DefaultModal>
    </div>
  )
}

export default Redirect
