import ToastComponent from '@/components/ToastComponent'

import axios, { AxiosResponse } from 'axios'

const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL
}

const instance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: 30000 // 30 seconds
})

const urlExceptAuthorization = ['Authenticate']

const getLangFromUrl = () => {
  // const lang = useSelector((state: any) => state.lang)
  const params = new URLSearchParams(window.location.search)
  const lang = params.get('lang') || 'vi'
  return lang
}

const authorization = async () => {
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams?.get('token')

  const lang = getLangFromUrl()

  if (token) {
    return { Authorization: 'Bearer ' + token, deviceId: '1718159750996', 'Accept-Language': lang }
  } else {
    return {
      'Accept-Language': lang
    }
  }
}

const getUrl = (config: any) => {
  if (config?.baseURL) {
    return config?.url.replace(config?.baseURL, '')
  }
  return config?.url
}

// Intercept all request
instance.interceptors.request.use(
  async (config: any) => {
    const url = getUrl(config)

    if (!urlExceptAuthorization.includes(url)) {
      const authHeader = await authorization()

      config.headers = {
        ...config.headers,
        ...authHeader
      } as any
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c Request: ${config?.method?.toUpperCase()} - ${getUrl(config)}:`, 'color: #0086b3; font-weight: bold', config)
    }
    return config
  },

  (error: any) => Promise.reject(error)
)

// Intercept all responses
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c Response: ${response?.status} - ${getUrl(response?.config)}:`, 'color: #008000; font-weight: bold', response)
    }

    return response.data
  },
  (error: any) => {
    if (process.env.NODE_ENV !== 'production') {
      if (error?.response) {
        ToastComponent({
          message: error?.response?.data?.message || 'Something went wrong, please try again',
          type: 'error'
        })

        if (error?.response?.data?.status === 401) {
          if (import.meta.env.VITE_MODE === 'local') return
          window.location.href = '/invalid'
        }
      } else if (error?.request) {
        console.log('====== Timeout =====')
      } else {
        console.log('====== Internal Server Error! =====')
      }
    }

    return Promise.reject(error)
  }
)

export default instance
