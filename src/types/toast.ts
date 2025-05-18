export type ToastType = 'default' | 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
  content: React.ReactNode
  type?: ToastType
  duration?: number
  persistent?: boolean
}

export interface Toast extends ToastOptions {
  id: number
}

export interface ToastContextType {
  addToast: (toast: ToastOptions) => void
}
