import {useToastContext} from '../providers/toast-provider'
import {type ToastOptions} from '../types/toast'

export function useToast() {
  const {addToast} = useToastContext()

  return {
    toast: (options: ToastOptions) => addToast({...options, type: 'default'}),
    info: (options: ToastOptions) => addToast({...options, type: 'info'}),
    success: (options: ToastOptions) => addToast({...options, type: 'success'}),
    warning: (options: ToastOptions) => addToast({...options, type: 'warning'}),
    error: (options: ToastOptions) => addToast({...options, type: 'error'}),
  }
}
