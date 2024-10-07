import instance from '@/services/axiosConfig'
import { THandlePostMessage } from '@/types'
import { objectToFormData } from '@/utils'

const fetchMessage = async ({ orderId, socket_id, user_id, page, limit = 10 }: { orderId: number; socket_id: string; user_id?: number; page: number; limit?: number }) => {
  const params = user_id ? { user_id } : {}
  const response = await instance.get(`/webview-cms/conversations/${orderId}`, { params: { ...params, page, limit, socket_id } })
  return response.data
}

const handlePostMessage = async ({ orderId, payload }: THandlePostMessage) => {
  const response = await instance.post(`/webview-cms/conversations/${orderId}`, objectToFormData(payload))
  return response.data
}

const fetchingDetailOrder = async ({ orderId, worker_id }: { orderId: number; worker_id: number }) => {
  const response = await instance.get(`/webview-cms/conversations/${orderId}`, { params: { worker_id } })
  return response.data
}

const handleClearConversation = async ({ orderId }: { orderId: number }) => {
  ///webview-cms/conversations/:orderId/clear
  const response = await instance.put(`/webview-cms/conversations/${orderId}/clear`)
  return response.data
}

export { fetchingDetailOrder, handlePostMessage, fetchMessage, handleClearConversation }
