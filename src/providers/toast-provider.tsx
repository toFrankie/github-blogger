import {uuid} from 'licia'
import {createContext, useCallback, useContext, useState} from 'react'
import ToastContainer from '@/components/toast/toast-container'
import {type Toast, type ToastContextType, type ToastOptions} from '@/types/toast'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

const TOAST_DEFAULT_OPTIONS = {
  withDismiss: true,
  duration: 3000,
} as const

export function ToastProvider({children}: {children: React.ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((content: string, options?: ToastOptions) => {
    const id = uuid()

    setToasts(prev => [
      ...prev,
      {
        id,
        content,
        ...TOAST_DEFAULT_OPTIONS,
        ...options,
      },
    ])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{addToast}}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}
