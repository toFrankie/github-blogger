import {XIcon} from '@primer/octicons-react'
import {Box, Flash, IconButton, Stack, Text} from '@primer/react'
import {useEffect, useState} from 'react'
import {type Toast} from '@/types/toast'

const VARIANT_MAP = {
  success: 'success',
  info: 'default',
  warning: 'warning',
  error: 'danger',
  default: 'default',
} as const

export default function ToastItem({toast, onClose}: {toast: Toast; onClose: () => void}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300) // 等待退出动画完成
    }, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '320px',
        height: '68px',
        transform: `translateX(${isVisible ? '0' : '100%'})`,
        opacity: isExiting ? 0 : 1,
        transition: isExiting
          ? 'opacity 0.3s ease-out'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: 'right',
        willChange: 'transform, opacity',
      }}
    >
      <Flash variant={VARIANT_MAP[toast.type || 'default']}>
        <Stack direction="horizontal" align="center" justify="space-between">
          <Stack.Item>
            <Text>{toast.content}</Text>
          </Stack.Item>
          {!toast.persistent && (
            <Stack.Item>
              <IconButton variant="invisible" icon={XIcon} onClick={onClose} aria-label="Close" />
            </Stack.Item>
          )}
        </Stack>
      </Flash>
    </Box>
  )
}
