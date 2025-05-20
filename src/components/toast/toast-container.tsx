import {Box, Portal, Stack} from '@primer/react'
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

  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          top: '8px',
          right: '8px',
          width: '320px',
          zIndex: 9999,
        }}
      >
        <Stack gap="condensed">
          {toasts.map((toast, idx) => (
            <Stack.Item
              key={toast.id}
              sx={{
                position: 'absolute',
                width: '100%',
                top: 0,
                right: 0,
                transform: `translateY(${idx * 76}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <ToastItem toast={toast} onClose={() => onDismiss(toast.id)} />
            </Stack.Item>
          ))}
        </Stack>
      </Box>
    </Portal>
  )
}
