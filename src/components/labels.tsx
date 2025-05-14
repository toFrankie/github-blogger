import {PlusIcon} from '@primer/octicons-react'
import {Box, Button, CounterLabel, Dialog, IssueLabelToken, Stack} from '@primer/react'
import {useState} from 'react'
import type {MinimalLabel, MinimalLabels} from '../types/label'
import LabelEditDialog from './label-edit-dialog'

interface LabelsProps {
  allLabel: MinimalLabels
  visible: boolean
  isPendingLabels: boolean
  onLabelCreate: (label: {name: string; color: string; description?: string}) => Promise<void>
  onLabelDelete: (labelName: string) => Promise<void>
  onLabelUpdate: (
    oldLabelName: string,
    newLabel: {name: string; color: string; description?: string}
  ) => Promise<void>
  onSetLabelsVisible: (visible: boolean) => void
  refetchAllIssues: () => void
}

export default function Labels({
  allLabel,
  visible,
  onSetLabelsVisible,
  onLabelCreate,
  onLabelDelete,
  onLabelUpdate,
  isPendingLabels,
  refetchAllIssues,
}: LabelsProps) {
  const [hoveredId, setHoveredId] = useState<string>('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<MinimalLabel | null | undefined>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openEditDialog = (label: MinimalLabel) => {
    setEditingLabel(label)
    setIsEditDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingLabel(undefined)
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingLabel(null)
  }

  const handleSave = async (labelData: {name: string; color: string; description?: string}) => {
    console.log('🚀 ~ handleSave ~ labelData:', labelData)

    // setIsSaving(true)

    // try {
    //   if (editingLabel && editingLabel.id) {
    //     if (
    //       labelData.name !== editingLabel.name &&
    //       allLabel.some(l => l.name === labelData.name && l.id !== editingLabel.id)
    //     ) {
    //       console.error('Label name already exists')
    //       setIsSaving(false)
    //       return
    //     }
    //     await onLabelUpdate(editingLabel.name, labelData)
    //   } else {
    //     if (allLabel.some(l => l.name === labelData.name)) {
    //       console.error('Label name already exists')
    //       setIsSaving(false)
    //       return
    //     }
    //     await onLabelCreate(labelData)
    //   }
    //   refetchAllIssues()
    //   closeEditDialog()
    // } catch (error) {
    //   console.error('Failed to save label:', error)
    // } finally {
    //   setIsSaving(false)
    // }
  }

  const handleDelete = async (labelName: string) => {
    console.log('🚀 ~ handleDelete ~ labelName:', labelName)

    // setIsDeleting(true)

    // try {
    //   await onLabelDelete(labelName)
    //   refetchAllIssues()
    //   closeEditDialog()
    // } catch (error) {
    //   console.error('Failed to delete label:', error)
    // } finally {
    //   setIsDeleting(false)
    // }
  }

  if (!visible) return null

  return (
    <>
      <Dialog
        position="right"
        width="medium"
        onClose={() => onSetLabelsVisible(false)}
        title={
          <Stack align="center" gap="condensed" direction="horizontal">
            <Stack.Item>Labels</Stack.Item>
            {allLabel.length > 0 && (
              <Stack.Item>
                <CounterLabel sx={{color: 'fg.muted'}}>{allLabel.length}</CounterLabel>
              </Stack.Item>
            )}
          </Stack>
        }
      >
        <Stack gap="condensed" direction="horizontal" wrap="wrap" sx={{p: 3}}>
          {allLabel.map(label => (
            <Stack.Item key={label.id} sx={{position: 'relative'}}>
              <Box
                onClick={() => openEditDialog(label)}
                sx={{cursor: 'pointer', display: 'inline-block'}}
                onMouseEnter={() => setHoveredId(label.id)}
                onMouseLeave={() => setHoveredId('')}
              >
                <IssueLabelToken
                  text={label.name}
                  fillColor={label.color.startsWith('#') ? label.color : `#${label.color}`}
                  size="large"
                />
              </Box>
            </Stack.Item>
          ))}

          <Stack.Item>
            <Button
              aria-label="Create new label"
              onClick={openCreateDialog}
              variant="default"
              sx={{
                color: 'fg.default',
                p: 1,
                border: 'none',
                boxShadow: 'none',
                bg: 'transparent',
                '&:hover': {bg: 'canvas.subtle'},
              }}
            >
              <PlusIcon size={16} />
              <Box as="span" sx={{ml: 1}}>
                New label
              </Box>
            </Button>
          </Stack.Item>
        </Stack>
      </Dialog>

      <LabelEditDialog
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        labelToEdit={editingLabel}
        onSave={handleSave}
        onDelete={editingLabel?.name ? handleDelete : undefined}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />
    </>
  )
}
