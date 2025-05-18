import ReactDOM from 'react-dom'
import {type Toast} from '@/types/toast'
import ToastItem from './toast-item'

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
      }}
    >
      {toasts.map((toast, idx) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onDismiss(toast.id)} index={idx} />
      ))}
    </div>,
    document.body
  )
}
