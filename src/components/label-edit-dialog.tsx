import {SyncIcon} from '@primer/octicons-react'
import {
  ActionMenu,
  Box,
  Dialog,
  FormControl,
  IssueLabelToken,
  Stack,
  Text,
  TextInput,
} from '@primer/react'
import {type FormEvent, useEffect, useState} from 'react'
import {DEFAULT_LABEL_COLOR, PREDEFINED_COLORS} from '../constants'

interface LabelEditDialogProps {
  isOpen: boolean
  onClose: () => void
  labelToEdit?: MinimalLabel | null
  onSave: (label: {name: string; color: string; description?: string}) => Promise<void>
  onDelete?: (labelName: string) => Promise<void>
  isSaving?: boolean
  isDeleting?: boolean
}

export default function LabelEditDialog({
  isOpen,
  onClose,
  labelToEdit,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: LabelEditDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [displayColorForToken, setDisplayColorForToken] = useState(DEFAULT_LABEL_COLOR)
  const [nameError, setNameError] = useState<string | null>(null)
  const [colorError, setColorError] = useState<string | null>(null)
  const [isColorInputInvalid, setIsColorInputInvalid] = useState(false)
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(
    PREDEFINED_COLORS.findIndex(
      color => color.toLowerCase() === DEFAULT_LABEL_COLOR.toLowerCase()
    ) || 0
  )
  const [isColorGridOpen, setIsColorGridOpen] = useState(false)

  const isEditing = !!labelToEdit

  useEffect(() => {
    if (!isOpen) return

    setIsColorInputInvalid(false)
    setNameError(null)
    setColorError(null)
    setIsColorGridOpen(false)

    if (labelToEdit) {
      setName(labelToEdit.name)
      setDescription(labelToEdit.description || '')
      const normalizedLabelColor = labelToEdit.color.startsWith('#')
        ? labelToEdit.color.slice(1)
        : labelToEdit.color

      if (normalizedLabelColor && /^[0-9A-Fa-f]{6}$/.test(normalizedLabelColor)) {
        setColor(normalizedLabelColor)
        setDisplayColorForToken(normalizedLabelColor)
        const foundIndex = PREDEFINED_COLORS.findIndex(
          color => color.toLowerCase() === normalizedLabelColor.toLowerCase()
        )
        setCurrentColorIndex(foundIndex !== -1 ? foundIndex : -1)
      } else if (normalizedLabelColor) {
        setColor(normalizedLabelColor)
        setDisplayColorForToken(DEFAULT_LABEL_COLOR)
        setIsColorInputInvalid(true)
        setCurrentColorIndex(
          PREDEFINED_COLORS.findIndex(
            color => color.toLowerCase() === DEFAULT_LABEL_COLOR.toLowerCase()
          ) || 0
        )
      } else {
        setColor('')
        setDisplayColorForToken(DEFAULT_LABEL_COLOR)
        setCurrentColorIndex(
          PREDEFINED_COLORS.findIndex(
            color => color.toLowerCase() === DEFAULT_LABEL_COLOR.toLowerCase()
          ) || 0
        )
      }
    } else {
      setName('')
      setDescription('')
      setColor('')
      setDisplayColorForToken(DEFAULT_LABEL_COLOR)
      setCurrentColorIndex(
        PREDEFINED_COLORS.findIndex(
          color => color.toLowerCase() === DEFAULT_LABEL_COLOR.toLowerCase()
        ) || 0
      )
    }
  }, [isOpen, labelToEdit])

  const validate = () => {
    let isValid = true
    if (!name.trim()) {
      setNameError('Label name is required.')
      isValid = false
    } else {
      setNameError(null)
    }
    if (color.trim() && !/^[0-9A-Fa-f]{6}$/.test(color)) {
      setColorError('Color must be a 6-character hex code (e.g., FF0000).')
      setIsColorInputInvalid(true)
      isValid = false
    } else {
      setColorError(null)
      setIsColorInputInvalid(false)
    }
    return isValid
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      return
    }
    const finalColor = color.trim() ? color : DEFAULT_LABEL_COLOR
    await onSave({name, color: `#${finalColor}`, description})
  }

  const handleDelete = async () => {
    if (labelToEdit && onDelete) {
      await onDelete(labelToEdit.name)
    }
  }

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newColorValue = e.target.value
    if (newColorValue.startsWith('#')) {
      newColorValue = newColorValue.substring(1)
    }
    newColorValue = newColorValue.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
    setColor(newColorValue)

    if (newColorValue.trim() === '') {
      setDisplayColorForToken(DEFAULT_LABEL_COLOR)
      setIsColorInputInvalid(false)
      setColorError(null)
      setCurrentColorIndex(
        PREDEFINED_COLORS.findIndex(
          color => color.toLowerCase() === DEFAULT_LABEL_COLOR.toLowerCase()
        ) || 0
      )
    } else if (/^[0-9A-Fa-f]{6}$/.test(newColorValue)) {
      setDisplayColorForToken(newColorValue)
      setIsColorInputInvalid(false)
      setColorError(null)
      const foundIndex = PREDEFINED_COLORS.findIndex(
        color => color.toLowerCase() === newColorValue.toLowerCase()
      )
      setCurrentColorIndex(foundIndex !== -1 ? foundIndex : -1)
    } else {
      setDisplayColorForToken(DEFAULT_LABEL_COLOR)
      setIsColorInputInvalid(true)
      setColorError(null)
      setCurrentColorIndex(-1)
    }
  }

  const handlePredefinedColorClick = (selectedColorFromGrid: string) => {
    const newColorValue = selectedColorFromGrid
    setColor(newColorValue)
    setDisplayColorForToken(newColorValue)
    setIsColorInputInvalid(false)
    const foundIndex = PREDEFINED_COLORS.findIndex(
      color => color.toLowerCase() === newColorValue.toLowerCase()
    )
    setCurrentColorIndex(foundIndex !== -1 ? foundIndex : -1)
    setColorError(null)
    setIsColorGridOpen(false)
  }

  const handleCycleColor = () => {
    let nextIndex = currentColorIndex
    if (currentColorIndex === -1 || currentColorIndex >= PREDEFINED_COLORS.length - 1) {
      nextIndex = 0
    } else {
      nextIndex = currentColorIndex + 1
    }
    const newColorValue = PREDEFINED_COLORS[nextIndex]
    setCurrentColorIndex(nextIndex)
    setColor(newColorValue)
    setDisplayColorForToken(newColorValue)
    setIsColorInputInvalid(false)
    setColorError(null)
  }

  if (!isOpen) return null

  const isColorFieldValidForSubmission =
    !color.trim() || (color.trim() && /^[0-9A-Fa-f]{6}$/.test(color))

  const canSubmit =
    name.trim() && isColorFieldValidForSubmission && !nameError && !isSaving && !isDeleting

  return (
    <Dialog
      title={isEditing ? 'Edit label' : 'Create new label'}
      onClose={onClose}
      footerButtons={[
        {
          buttonType: 'danger',
          content: isDeleting ? 'Deleting...' : 'Delete',
          onClick: handleDelete,
          disabled: isDeleting || isSaving,
        },
        {
          buttonType: 'default',
          content: 'Cancel',
          onClick: onClose,
          disabled: isSaving || isDeleting,
        },
        {
          buttonType: 'primary',
          content: isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Create label',
          onClick: handleSubmit,
          disabled: !canSubmit || isSaving,
        },
      ]}
    >
      <Stack as="form" onSubmit={handleSubmit}>
        <Stack.Item>
          <FormControl required>
            <FormControl.Label requiredText="">Name</FormControl.Label>
            <TextInput
              block
              value={name}
              aria-label="Label name"
              placeholder="Label name"
              maxLength={50}
              onChange={e => {
                setName(e.target.value)
                if (nameError && e.target.value.trim()) setNameError(null)
              }}
            />
            {nameError && (
              <FormControl.Validation variant="error">{nameError}</FormControl.Validation>
            )}
          </FormControl>
        </Stack.Item>
        <Stack.Item>
          <FormControl>
            <FormControl.Label>Description</FormControl.Label>
            <TextInput
              block
              value={description}
              aria-label="Label description (optional)"
              placeholder="Label description (optional)"
              maxLength={100}
              onChange={e => setDescription(e.target.value)}
            />
          </FormControl>
        </Stack.Item>

        <Stack.Item>
          <FormControl>
            <FormControl.Label htmlFor="color-input">Color</FormControl.Label>
            <Stack direction="horizontal" gap="condensed" align="center">
              <Stack.Item>
                <TextInput
                  id="color-input"
                  leadingVisual="#"
                  value={color}
                  onChange={handleColorInputChange}
                  placeholder={DEFAULT_LABEL_COLOR}
                  maxLength={6}
                  aria-label="Hex color code for Color input"
                  sx={{width: '100px'}}
                />
              </Stack.Item>
              <Stack.Item>
                <ActionMenu open={isColorGridOpen} onOpenChange={setIsColorGridOpen}>
                  <ActionMenu.Button
                    aria-label="Open color picker"
                    variant="default"
                    sx={{paddingLeft: 'condensed', paddingRight: 'condensed'}}
                  >
                    Colors
                  </ActionMenu.Button>
                  <ActionMenu.Overlay width="medium" sx={{p: 2}}>
                    <Stack direction="vertical" gap="condensed">
                      <Text sx={{fontSize: 0, color: 'fg.muted'}}>Choose from default colors:</Text>
                      <Stack direction="horizontal" gap="condensed" wrap="wrap">
                        {PREDEFINED_COLORS.map(color => (
                          <Box
                            key={color}
                            as="button"
                            type="button"
                            aria-label={`Select color ${color}`}
                            onClick={() => handlePredefinedColorClick(color)}
                            sx={{
                              width: '24px',
                              height: '24px',
                              bg: `#${color}`,
                              borderRadius: '50%',
                              border: '1px solid',
                              cursor: 'pointer',
                              borderColor:
                                displayColorForToken.toLowerCase() === color.toLowerCase()
                                  ? 'accent.fg'
                                  : 'border.default',
                              outlineOffset: '2px',
                              '&:focus-visible': {
                                boxShadow: `0 0 0 3px var(--brand-bgColor-accent-emphasis, var(--bgColor-accent-emphasis, #0969da))`,
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </Stack.Item>
              <Stack.Item sx={{position: 'relative'}}>
                <IssueLabelToken
                  text={<SyncIcon size={16} />}
                  size="large"
                  fillColor={`#${displayColorForToken || DEFAULT_LABEL_COLOR}`}
                />
                <Box
                  onClick={handleCycleColor}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </Stack.Item>
            </Stack>
          </FormControl>
          {colorError && <Text sx={{color: 'danger.fg', fontSize: 0, mt: 1}}>{colorError}</Text>}
        </Stack.Item>
      </Stack>
    </Dialog>
  )
}
