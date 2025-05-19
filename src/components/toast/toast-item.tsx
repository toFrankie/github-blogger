import {AlertIcon, CheckIcon, InfoIcon, StopIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'
import {useEffect, useState} from 'react'
import {type Toast} from '@/types/toast'

const ICON_MAP = {
  success: <CheckIcon />,
  info: <InfoIcon />,
  warning: <AlertIcon />,
  error: <StopIcon />,
  default: null,
}

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
        p: 3,
        borderRadius: 2,
        bg: 'canvas.default',
        boxShadow: 'shadow.medium',
        color: 'fg.default',
        fontSize: 1,
        lineHeight: 'default',
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          {ICON_MAP[toast.type || 'default']}
          <Text>{toast.content}</Text>
        </Box>
        {!toast.persistent && (
          <Button variant="invisible" size="small" onClick={onClose} sx={{ml: 2}}>
            <XIcon />
          </Button>
        )}
      </Box>
    </Box>
  )
}
