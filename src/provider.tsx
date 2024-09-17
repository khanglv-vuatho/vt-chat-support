import { NextUIProvider } from '@nextui-org/system'
import { useNavigate } from 'react-router-dom'
import store from '@/store'
import { Provider as ReduxProvider } from 'react-redux'
import Wrapper from './wrapper'
import { ToastContainer } from 'react-toastify'
import { SocketProvider } from './context/SocketProvider'

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token') as string

  return (
    <NextUIProvider navigate={navigate}>
      <ReduxProvider store={store}>
        <ToastContainer />
        <Wrapper>
          <SocketProvider token={token}>{children}</SocketProvider>
        </Wrapper>
      </ReduxProvider>
    </NextUIProvider>
  )
}
