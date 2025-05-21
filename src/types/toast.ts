export type ToastType = 'critical' | 'info' | 'success' | 'upsell' | 'warning'

export interface ToastOptions {
  type?: ToastType
  duration?: number
  persistent?: boolean
}

export interface Toast extends ToastOptions {
  id: string
  content: string
}

export interface ToastContextType {
  addToast: (content: string, options?: ToastOptions) => void
}
