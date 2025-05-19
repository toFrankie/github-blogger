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
  if (toasts.length === 0) return null

  const overlayHeight = toasts.length * 76 + 32 // 每条通知 76px + 上下各 16px 的间距

  return ReactDOM.createPortal(
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '360px',
          height: `${overlayHeight}px`,
          background: 'var(--color-overlay-backdrop)',
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: '320px',
          zIndex: 9999,
        }}
      >
        {toasts.map((toast, idx) => (
          <div
            key={toast.id}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              transform: `translateY(${idx * 76}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <ToastItem toast={toast} onClose={() => onDismiss(toast.id)} />
          </div>
        ))}
      </div>
    </>,
    document.body
  )
}
