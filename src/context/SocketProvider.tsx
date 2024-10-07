import { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = createContext({})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children, token, isAdmin }: { children: React.ReactNode; token: string; isAdmin: boolean }) => {
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    if (isAdmin) return

    const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      query: { token, platform: 'webview' },
      reconnection: true,
      autoConnect: true
    })

    setSocket(newSocket)
    const handleConnectSocket = () => {
      newSocket.connect()
    }

    document.addEventListener('visibilitychange', () => handleConnectSocket())
    window.addEventListener('blur', () => handleConnectSocket())
    window.addEventListener('focus', () => handleConnectSocket())

    return () => {
      newSocket.disconnect()
      document.removeEventListener('visibilitychange', () => handleConnectSocket())
      window.removeEventListener('blur', () => handleConnectSocket())
      window.removeEventListener('focus', () => handleConnectSocket())
    }
  }, [token, isAdmin])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
