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
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDI5LCJmdWxsX25hbWUiOiJMw6ogSMOgIEdpYSBLaMO0aSIsInByb2ZpbGVfcGljdHVyZSI6Imh0dHBzOi8vY2RuLXNhbmRib3gudnVhdGhvLmNvbS9pbWFnZS9hZGJmNTljZC1jOTM1LTRhYTMtYjI0Zi00YjczYjczZDUzYjVfMTcyMTAyOTAxMDkxMC5wbmciLCJyZWZfaWQiOm51bGwsImt5Y19zdGF0dXMiOjIsIndvcmtlcl9zdGF0dXMiOjIsInNlc3Npb25fbG9naW5zIjpbeyJJUCI6IjExMy4xNjEuOTAuMjIyIiwiZGV2aWNlIjoiMTcyNDIxNjQxNTA2MCIsInRpbWUiOjE3MjQyMTY0MTUwNjB9XSwiaWF0IjoxNzI0MjE2NDE1fQ.mAQrIhYM77pwDPAN5zoNIFlhabPbttHBtHaZR-CVEdA'
      })
    )
  }
  const handleRedirectWClient = () => {
    navigate(
      handleAddLangInUrl({
        lang: 'vi',
        mainUrl: '/chat?currentId=570&orderId=3861&worker_id=429',
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTcwLCJmdWxsX25hbWUiOiJsZWhhZ2lha2hvaSIsInByb2ZpbGVfcGljdHVyZSI6Imh0dHBzOi8vY2RuLXNhbmRib3gudnVhdGhvLmNvbS9pbWFnZS8zOGI2MTM1Yi0wY2ViLTQ4ZTEtYWE3Ny0xZjcwNWQ1ZmU0MzhfMTcyMDQyNDE0OTE1Mi5qcGciLCJyZWZfaWQiOm51bGwsImt5Y19zdGF0dXMiOjIsIndvcmtlcl9zdGF0dXMiOjIsInNlc3Npb25fbG9naW5zIjpbeyJJUCI6IjExMy4xNjEuOTAuMjIyIiwiZGV2aWNlIjoiMTcyNDMxNjg4NTAxMyIsInRpbWUiOjE3MjQzMTY4ODUwMTN9XSwiaWF0IjoxNzI0MzE2ODg1fQ.mRnY_vqDEYrlSzsRS6vf4fndFPP91C6V1H9HJM8FrU0'
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
