import {SparkleFillIcon, SyncIcon} from '@primer/octicons-react'
import {
  ActionMenu,
  Box,
  Dialog,
  type DialogButtonProps,
  FormControl,
  IssueLabelToken,
  Stack,
  Text,
  TextInput,
} from '@primer/react'
import {useEffect, useState} from 'react'
import {LABEL_DEFAULT_COLOR, LABEL_PREDEFINED_COLORS} from '@/constants'

const CYCLE_COLORS = [...LABEL_PREDEFINED_COLORS, LABEL_DEFAULT_COLOR]

const HEX_COLOR_REGEX = /^[0-9A-Fa-f]{6}$/

interface LabelEditDialogProps {
  isSaving?: boolean
  isDeleting?: boolean
  label?: MinimalLabel | null
  allLabelName: string[]
  onSave: (label: {name: string; color: string; description: string | null}) => Promise<void>
  onDelete?: (labelName: string) => Promise<void>
  onClose: () => void
}

export default function LabelEditDialog({
  isSaving,
  isDeleting,
  label: originalLabel,
  allLabelName,
  onSave,
  onDelete,
  onClose,
}: LabelEditDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [displayColorForToken, setDisplayColorForToken] = useState(LABEL_DEFAULT_COLOR)
  const [nameError, setNameError] = useState<string | null>(null)
  const [colorError, setColorError] = useState<string | null>(null)
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(
    CYCLE_COLORS.findIndex(color => color.toUpperCase() === LABEL_DEFAULT_COLOR.toUpperCase()) || 0
  )
  const [isColorGridOpen, setIsColorGridOpen] = useState(false)

  const isEditing = !!originalLabel

  useEffect(() => {
    setNameError(null)
    setColorError(null)
    setIsColorGridOpen(false)

    if (!originalLabel) {
      setName('')
      setDescription('')
      setColor('')
      setDisplayColorForToken(LABEL_DEFAULT_COLOR)
      setCurrentColorIndex(
        CYCLE_COLORS.findIndex(
          color => color.toUpperCase() === LABEL_DEFAULT_COLOR.toUpperCase()
        ) || 0
      )

      return
    }

    setName(originalLabel.name)
    setDescription(originalLabel.description || '')

    const labelColor = originalLabel.color

    if (labelColor && HEX_COLOR_REGEX.test(labelColor)) {
      setColor(labelColor)
      setDisplayColorForToken(labelColor)
      const foundIndex = CYCLE_COLORS.findIndex(
        color => color.toUpperCase() === labelColor.toUpperCase()
      )
      setCurrentColorIndex(foundIndex !== -1 ? foundIndex : -1)
    } else if (labelColor) {
      setColor(labelColor)
      setDisplayColorForToken(LABEL_DEFAULT_COLOR)
      setCurrentColorIndex(
        CYCLE_COLORS.findIndex(
          color => color.toUpperCase() === LABEL_DEFAULT_COLOR.toUpperCase()
        ) || 0
      )
    } else {
      setColor('')
      setDisplayColorForToken(LABEL_DEFAULT_COLOR)
      setCurrentColorIndex(
        CYCLE_COLORS.findIndex(
          color => color.toUpperCase() === LABEL_DEFAULT_COLOR.toUpperCase()
        ) || 0
      )
    }
  }, [originalLabel])

  const validate = () => {
    let isValid = true

    const formattedName = name.trim()

    if (!formattedName) {
      setNameError('Label name is required.')
      isValid = false
    } else if (allLabelName.includes(formattedName)) {
      setNameError('Name has already been taken.')
      isValid = false
    } else {
      setNameError(null)
    }

    if (color.trim() && !HEX_COLOR_REGEX.test(color)) {
      setColorError('Color must be a 6-character hex code (e.g. FF0000).')
      isValid = false
    } else {
      setColorError(null)
    }

    return isValid
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const data = {
      name: name.trim(),
      color: color.trim() || LABEL_DEFAULT_COLOR,
      description: description.trim() || null,
    }

    await onSave(data)
  }

  const handleDelete = async () => {
    if (originalLabel && onDelete) {
      await onDelete(originalLabel.name)
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
      setDisplayColorForToken(LABEL_DEFAULT_COLOR)
      setColorError(null)
      setCurrentColorIndex(
        CYCLE_COLORS.findIndex(
          color => color.toUpperCase() === LABEL_DEFAULT_COLOR.toUpperCase()
        ) || 0
      )
    } else if (HEX_COLOR_REGEX.test(newColorValue)) {
      setDisplayColorForToken(newColorValue)
      setColorError(null)
      const foundIndex = CYCLE_COLORS.findIndex(
        color => color.toUpperCase() === newColorValue.toUpperCase()
      )
      setCurrentColorIndex(foundIndex !== -1 ? foundIndex : -1)
    } else {
      setDisplayColorForToken(LABEL_DEFAULT_COLOR)
      setColorError(null)
      setCurrentColorIndex(-1)
    }
  }

  const handlePredefinedColorClick = (selectedColorFromGrid: string) => {
    const newColorValue = selectedColorFromGrid
    setColor(newColorValue)
    setDisplayColorForToken(newColorValue)
    const foundIndex = CYCLE_COLORS.findIndex(
      color => color.toUpperCase() === newColorValue.toUpperCase()
    )
    setCurrentColorIndex(foundIndex !== -1 ? foundIndex : -1)
    setColorError(null)
    setIsColorGridOpen(false)
  }

  const handleCycleColor = () => {
    let nextIndex = currentColorIndex
    if (currentColorIndex === -1 || currentColorIndex >= CYCLE_COLORS.length - 1) {
      nextIndex = 0
    } else {
      nextIndex = currentColorIndex + 1
    }
    const newColorValue = CYCLE_COLORS[nextIndex]
    setCurrentColorIndex(nextIndex)
    setColor(newColorValue)
    setDisplayColorForToken(newColorValue)
    setColorError(null)
  }

  const isColorFieldValidForSubmission =
    !color.trim() || (color.trim() && HEX_COLOR_REGEX.test(color))

  const canSubmit =
    name.trim() && isColorFieldValidForSubmission && !nameError && !isSaving && !isDeleting

  const footerButtons: DialogButtonProps[] = [
    ...(isEditing
      ? [
          {
            buttonType: 'danger' as const,
            content: isDeleting ? 'Deleting...' : 'Delete',
            onClick: handleDelete,
            disabled: isDeleting || isSaving,
          },
        ]
      : []),
    {
      buttonType: 'default' as const,
      content: 'Cancel',
      onClick: onClose,
      disabled: isSaving || isDeleting,
    },
    {
      buttonType: 'primary' as const,
      content: isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Create label',
      onClick: handleSubmit,
      disabled: !canSubmit || isSaving,
    },
  ]

  return (
    <Dialog
      title={isEditing ? 'Edit label' : 'Create new label'}
      onClose={onClose}
      footerButtons={footerButtons}
    >
      <Stack as="form">
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
            {colorError ? (
              <FormControl.Validation variant="error">{colorError}</FormControl.Validation>
            ) : (
              <FormControl.Caption>A 6-character hex code (e.g. FF0000).</FormControl.Caption>
            )}
            <Stack direction="horizontal" gap="condensed" align="center">
              <Stack.Item>
                <TextInput
                  id="color-input"
                  leadingVisual="#"
                  value={color}
                  onChange={handleColorInputChange}
                  placeholder={LABEL_DEFAULT_COLOR}
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
                        {CYCLE_COLORS.map(color => (
                          <Stack.Item key={color} sx={{position: 'relative'}}>
                            <IssueLabelToken
                              text={<SparkleFillIcon size={16} />}
                              size="large"
                              fillColor={`#${color}`}
                            />
                            <Box
                              aria-label={`Select color ${color}`}
                              onClick={() => handlePredefinedColorClick(color)}
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
                  fillColor={`#${displayColorForToken || LABEL_DEFAULT_COLOR}`}
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
        </Stack.Item>
      </Stack>
    </Dialog>
  )
}
