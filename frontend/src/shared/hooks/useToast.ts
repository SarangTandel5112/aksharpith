import { toast } from 'sonner'

type ToastApi = {
  success: (message: string) => void
  error:   (message: string) => void
  info:    (message: string) => void
  warning: (message: string) => void
}

export function useToast(): ToastApi {
  return {
    success: (message) => toast.success(message),
    error:   (message) => toast.error(message),
    info:    (message) => toast.info(message),
    warning: (message) => toast.warning(message),
  }
}
