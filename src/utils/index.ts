import ToastComponent from '@/components/ToastComponent'
import { typeOfPriceOfOrderDetail } from '@/constants'
import { Message, MessageGroup, TOrderDetail, TPostMessage } from '@/types'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
const useUnfocusItem = (callback: () => void, exclusionRef?: React.RefObject<HTMLElement | null>): React.RefObject<any> => {
  const itemRef = useRef<any>(null)

  useEffect(() => {
    const handleBlur = (event: Event) => {
      const clickedOutside = itemRef.current && !itemRef.current.contains(event.target as Node)

      const clickedOnExclusion = exclusionRef && exclusionRef.current && exclusionRef.current.contains(event.target as Node)

      if (clickedOutside && !clickedOnExclusion) {
        callback()
      }
    }

    document.addEventListener('click', handleBlur)

    return () => {
      document.removeEventListener('click', handleBlur)
    }
  }, [callback, exclusionRef])

  return itemRef
}

function capitalizeWords(string: string) {
  if (!string) return ''
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const handler: any = useRef(null)

  useEffect(() => {
    // Clear the timeout if value changes (cleanup function)
    if (handler.current) {
      clearTimeout(handler.current)
    }

    // Set the timeout to update debouncedValue after the specified delay
    handler.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function to clear timeout if component unmounts or value changes
    return () => {
      if (handler.current) {
        clearTimeout(handler.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

const handleAddLangInUrl = ({ mainUrl, lang, token }: { mainUrl: string; lang: string; token: string }) => {
  return `${mainUrl}&lang=${lang}&token=${token}`
}

const formatLocalTime = (time: string) => {
  const utcMoment = moment.utc(time, 'HH:mm:ss')
  const localTime = utcMoment.local().format('HH:mm:ss')
  return localTime
}

const formatDDMMYYYY = (time: string) => {
  return moment(time).format('DD/MM/YYYY')
}

const formatLocalHoursTime = (time: number) => {
  const utcDate = moment.utc(time)

  // Convert the UTC date to local time
  const localDate = utcDate.local()

  // Format the local date to hh:mm format
  return localDate.format('HH:mm')
}

const formatTimestamp = (timestamp: number) => {
  // Chuyển đổi timestamp sang đối tượng Date
  const date = new Date(timestamp)

  // Lấy thời gian local dạng chuỗi
  const localDateString = date.toLocaleString()

  return localDateString
}

const postMessageCustom = ({ message, data = {} }: TPostMessage) => {
  //@ts-ignore
  if (window?.vuatho) {
    //@ts-ignore
    window?.vuatho?.postMessage(
      JSON.stringify({
        message,
        data
      })
    )
  } else {
    ToastComponent({ message: message || 'has bug here', type: 'error' })
  }
}

const objectToFormData = (obj: any) => {
  const formData = new FormData()

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      const valueIsFile = value instanceof File

      const isArrayData = Array.isArray(value)
      const initialValue = typeof value === 'number' ? Number(value) : ''

      if (isArrayData) {
        const isFile = value.some((item) => item instanceof File)
        if (isFile) {
          Array.prototype.forEach.call(value, (item) => {
            formData.append(key, item)
          })
        } else {
          formData.append(key, value ? JSON.stringify(value) : '')
        }
      } else {
        if (typeof value === 'object' && !isArrayData && !valueIsFile) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value || initialValue)
        }
      }
    }
  }

  return formData
}

const handleToastNoNetwork = () => {
  ToastComponent({ type: 'error', message: 'Không có kết nối mạng, vui lòng kiểm tra lại!' })
}

const groupConsecutiveMessages = (messages: Message[]): MessageGroup[] => {
  if (messages.length === 0) return []

  const groupedMessages: MessageGroup[] = []
  let currentGroup: Message[] = [messages[0]]
  let currentUserId = messages[0].by.id
  let lastMessageTime = new Date(messages[0].created_at).getTime()

  for (let i = 1; i < messages.length; i++) {
    const currentMessageTime = new Date(messages[i].created_at).getTime()
    const timeDifference = (currentMessageTime - lastMessageTime) / (1000 * 60) // difference in minutes

    if (messages[i].by.id === currentUserId && timeDifference <= 1) {
      currentGroup.push(messages[i])
    } else {
      // Mark first and last messages in the current group if there are 2 or more messages
      if (currentGroup.length >= 2) {
        currentGroup[0].first = true
        currentGroup[currentGroup.length - 1].last = true
      }
      groupedMessages.push({ userId: currentUserId, messages: currentGroup })
      currentGroup = [messages[i]]
      currentUserId = messages[i].by.id

      // Add isOneGroup: true if timeDifference > 1
      if (timeDifference > 1) {
        currentGroup[0].isOneGroup = true
      }
    }

    lastMessageTime = currentMessageTime
  }

  // Mark first and last messages in the last group if there are 2 or more messages
  if (currentGroup.length >= 2) {
    currentGroup[0].first = true
    currentGroup[currentGroup.length - 1].last = true
  }
  groupedMessages.push({ userId: currentUserId, messages: currentGroup })

  return groupedMessages
}

const isStringWithoutEmoji = (value: string) => {
  if (typeof value !== 'string') {
    return false
  }

  // Biểu thức chính quy để kiểm tra emoji
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

  return !emojiRegex.test(value)
}

const getPriceDetails = (orderDetail: TOrderDetail) => {
  const { final_price, first_price } = orderDetail?.billing || {}
  const isFinalPrice = final_price !== 0

  return {
    price: isFinalPrice ? final_price : first_price,
    status: isFinalPrice ? typeOfPriceOfOrderDetail.final_price : typeOfPriceOfOrderDetail.frist_price
  }
}

const haversineDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }) => {
  if (coords1 === undefined || coords2 === undefined) return
  const toRad = (x: number) => (x * Math.PI) / 180

  const lat1 = coords1.lat
  const lon1 = coords1.lng
  const lat2 = coords2.lat
  const lon2 = coords2.lng

  const R = 6371 // Bán kính Trái Đất tính bằng km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Khoảng cách tính bằng km

  return Number(distance.toFixed(2)) // Làm tròn 2 chữ số thập phân
}
const isMobileWithUserAgent = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
export {
  capitalizeWords,
  formatDDMMYYYY,
  formatLocalHoursTime,
  formatLocalTime,
  formatTimestamp,
  getPriceDetails,
  groupConsecutiveMessages,
  handleAddLangInUrl,
  handleToastNoNetwork,
  haversineDistance,
  isMobileWithUserAgent,
  isStringWithoutEmoji,
  objectToFormData,
  postMessageCustom,
  useDebounce,
  useUnfocusItem
}
