import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { TranslationProvider } from './context/translationProvider'
import { ActionTypes } from './store'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')
  const lang = queryParams.get('lang') || 'vi'

  const checkSession = useCallback(async () => {
    if (token) {
      dispatch({
        type: ActionTypes.TOKEN,
        payload: token
      })
    } else {
      if (import.meta.env.VITE_MODE === 'local') return
      navigate('/invalid')
    }
  }, [navigate])

  useEffect(() => {
    if (import.meta.env.VITEMODE === 'development') return

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor

      const regexString = import.meta.env.VITE_API_REGEX
      if (regexString) {
        try {
          const isAppWebView = regexString == ua
          if (isAppWebView) {
            checkSession()
          } else {
            if (import.meta.env.VITE_MODE === 'local') return
            navigate('/invalid')
          }
        } catch (error) {
          console.log({ error })
        }
      } else {
        console.error('VITE_API_REGEX is not defined')
      }
    }
  }, [navigate])

  return <TranslationProvider lang={lang}>{children}</TranslationProvider>
}

export default Wrapper
