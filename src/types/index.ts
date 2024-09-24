import { TypeOfRule } from '@/constants'
import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export type RatingTabType = { name: string; timeHour: string; timeDate: string; star: number; thumbnail: string; description: string }

export type GroupedMessage = {
  username: string
  messages: MessageDetail[]
  time: number
}

export type MessageDetail = {
  username: string
  message: string
  time: number
  type: string
  emoji?: string
  messageId?: string
}

export type Avatar = {
  url: string
  storage: string
}

export type User = {
  id: number
  avatar: Avatar | null
  full_name: string
  profile_picture: string
}

type TSeen = {
  id: number
  seen_at: number
}
export type Message = {
  attachments?: TImageData[]
  by: User
  id: number
  seen: TSeen | null
  type: 0 | 1
  content: string
  created_at: number
  first?: boolean // Added field
  last?: boolean // Added field
  status: 'sent' | 'pending' | 'failed' | 'seen'
  isOneGroup?: boolean
}

export type MessageGroup = {
  userId: number
  messages: Message[]
}

export type MessageProps = {
  message: string
}

export type TPostMessage = { message: string; data?: any }

export type TFetchMessageOfCline = { orderId: number; worker_id: number }

export type TPayloadHandleSendMessageApi = {
  content: string
  worker_id?: number
  attachment?: any
  type: 0 | 1
  socket_id: string
  conversationId: number
  messageId: number
}

export type THandlePostMessage = {
  orderId: number
  payload: TPayloadHandleSendMessageApi
  rule: TypeOfRule
}

export type TImageData = {
  url: string
  type: number
  storage: string
}

export type THandleSendMessage = MessageProps & { type?: 0 | 1; attachment?: any }

type TTranslation = {
  [key: string]: string
}

type TAttachment = {
  url: string
  storage: string
  // Define the structure of an attachment if available
}

type TProgress = {
  by: string | null
  time: number
  title: string
  reason: string
  status: number
  location: string | null
  worker_id: number | null
  attachments: TAttachment[]
  status_before_cancel: number
}

type TProblem = {
  id: number
  title: TTranslation
  attachments: TAttachment[]
  description: string
}

type TLocation = {
  lat: number
  lng: number
  address?: string
}

type TGuarantee = {
  end: string | null
  start: string | null
  status: number
  duration: number
  time_remaining?: string | null
  percent: number
}

type TWorker = {
  id: number
  price: number
  location: TLocation
  guarantee: TGuarantee
  min_price: number
  quote_type: number
  quoted_time: number
  in_app_call_times: number
}

type TBilling = {
  fee: number
  tip: number
  vat: number
  total: number
  discount: number
  final_price: number
  first_price: number
  last_accepted_price: number
}

type THistory = {
  by: string
  time: number
  title: string
  reason: string
  status: number
}

type TServiceInfo = {
  id: number
  name: TTranslation
  icon: string
  fee_rate: number
}

export type TOrderDetail = {
  id: number
  service_id: number
  progresses: TProgress[]
  worker_id: number | null
  user_id: number
  status: number
  problems: TProblem[]
  time_will_work: string
  location: TLocation
  worker_list: TWorker[]
  is_now: boolean
  payment: any // Define a more specific type if available
  voucher: any // Define a more specific type if available
  billing: TBilling
  is_deleted: boolean | null
  created_at: string
  deal_status: number
  extract_problem_id: number
  popups: any // Define a more specific type if available
  histories: THistory[]
  last_accepted_price: number | null
  detail_last_accepted_price: any // Define a more specific type if available
  notified_workers_count: number
  guarantee: TGuarantee
  service_info: TServiceInfo
  can_feedback: boolean
  feedback: any // Define a more specific type if available
  client_phone: TPhoneDetail
  worker_phone: TPhoneDetail
}

type TPhoneDetail = {
  phone: {
    phone_code: string
    phone_number: string
  }
}

export type TConversationInfo = {
  data: Message[]
  order_id: number
  worker_id: number
  conversation_id: number
  worker_picture: string
  client_picture: string
}

export type THandleSendMessageApi = MessageProps & { messageId: number; type: 0 | 1; attachment?: any; socket_id: string }

export type TInfoTyping = {
  is_typing: boolean
  user_id: number
  socket_id: string
}

export type TMeta = {
  total_pages: number
  total_item: number
  page: number
  limit: number
}
