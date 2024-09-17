import { ToastOptions, TypeOptions, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type ToastComponentProps = {
  message: string
  autoClose?: number
  hideProgressBar?: boolean
  closeOnClick?: boolean
  pauseOnHover?: boolean
  draggable?: boolean
  type: TypeOptions
} & ToastOptions

const ToastComponent = ({ message, autoClose, hideProgressBar, closeOnClick, pauseOnHover, draggable, type, ...props }: ToastComponentProps) => {
  const toastId = message // Use message as the ID or generate a unique ID

  if (!toast.isActive(toastId)) {
    toast(message, {
      toastId,
      position: 'top-right',
      autoClose: autoClose || 2000,
      hideProgressBar: hideProgressBar || false,
      closeOnClick: closeOnClick || true,
      pauseOnHover: pauseOnHover || true,
      draggable: draggable || true,
      progress: undefined,
      type: type,
      ...props
    })
  }
}

export default ToastComponent
