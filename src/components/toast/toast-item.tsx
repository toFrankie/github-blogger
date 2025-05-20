import {Box} from '@primer/react'
import {Banner} from '@primer/react/experimental'
import {useEffect, useState} from 'react'
import {type Toast} from '@/types/toast'

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

export default function ToastItem({toast, onClose}: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        transform: `translateX(${isVisible ? '0' : '100%'})`,
        opacity: isExiting ? 0 : 1,
        transition: isExiting
          ? 'opacity 0.3s ease-out'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: 'right',
        willChange: 'transform, opacity',
      }}
    >
      <Banner
        hideTitle
        title="Notice"
        variant={toast.type || 'info'}
        onDismiss={!toast.persistent ? onClose : undefined}
      >
        {toast.content}
      </Banner>
    </Box>
  )
}
