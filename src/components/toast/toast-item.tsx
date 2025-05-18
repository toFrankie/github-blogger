import {AlertIcon, CheckIcon, InfoIcon, StopIcon, XIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import {useEffect, useState} from 'react'
import {type Toast} from '@/types/toast'

const ICON_MAP = {
  success: <CheckIcon />,
  info: <InfoIcon />,
  warning: <AlertIcon />,
  error: <StopIcon />,
  default: null,
}

export default function ToastItem({
  toast,
  onClose,
  index,
}: {
  toast: Toast
  onClose: () => void
  index: number
}) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (exiting) {
      const timeout = setTimeout(onClose, 300)
      return () => clearTimeout(timeout)
    }
  }, [exiting, onClose])

  const handleClose = () => setExiting(true)

  return (
    <div
      className={`anim-fade-${exiting ? 'out' : 'in'} color-bg-subtle`}
      style={{
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: exiting ? 'translateX(100%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        backgroundColor: 'red',
      }}
    >
      <Box
        sx={{
          minWidth: 240,
          maxWidth: 400,
          boxShadow: 'shadow.medium',
          animation: exiting ? 'fadeOut 0.3s' : 'fadeIn 0.3s',
          backgroundColor: 'red',
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span>{toast.content}</span>
          {!toast.persistent && (
            <Button variant="invisible" size="small" onClick={handleClose}>
              <XIcon />
            </Button>
          )}
        </div>
      </Box>
    </div>
  )
}
