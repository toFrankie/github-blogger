import {createContext, useCallback, useContext, useState} from 'react'
import ToastContainer from '@/components/toast/toast-container'
import {type Toast, type ToastContextType, type ToastOptions} from '@/types/toast'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export function ToastProvider({children}: {children: React.ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((options: ToastOptions) => {
    const id = ++toastId
    setToasts(prev => [...prev, {id, ...options}])
    if (!options.persistent) {
      setTimeout(() => removeToast(id), options.duration ?? 4000)
    }
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{addToast}}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider')
  return ctx
}
