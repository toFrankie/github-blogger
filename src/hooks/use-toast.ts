import {useToastContext} from '@/providers/toast-provider'
import {type ToastOptions} from '@/types/toast'

export function useToast() {
  const {addToast} = useToastContext()

  return {
    toast: (content: string, options?: ToastOptions) =>
      addToast(content, {...options, type: 'info'}),

    info: (content: string, options?: ToastOptions) =>
      addToast(content, {...options, type: 'info'}),

    success: (content: string, options?: ToastOptions) =>
      addToast(content, {...options, type: 'success'}),

    warning: (content: string, options?: ToastOptions) =>
      addToast(content, {...options, type: 'warning'}),

    critical: (content: string, options?: ToastOptions) =>
      addToast(content, {...options, type: 'critical'}),

    upsell: (content: string, options?: ToastOptions) =>
      addToast(content, {...options, type: 'upsell'}),
  }
}
