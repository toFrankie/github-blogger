import {PlusIcon} from '@primer/octicons-react'
import {Box, CounterLabel, Dialog, IssueLabelToken, Stack} from '@primer/react'
import {useMemo, useState} from 'react'
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
  const [editingLabel, setEditingLabel] = useState<MinimalLabel | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const allLabelName = useMemo(() => {
    return allLabel
      .filter(label => !editingLabel || label.id !== editingLabel.id)
      .map(label => label.name)
  }, [allLabel, editingLabel])

  const openEditDialog = (label: MinimalLabel) => {
    setEditingLabel(label)
    setIsEditDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingLabel(null)
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingLabel(null)
  }

  const handleSave = async (labelData: {
    name: string
    color: string
    description: string | null
  }) => {
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
        <Stack gap="condensed" direction="horizontal" wrap="wrap">
          {allLabel.map(label => (
            <Stack.Item
              key={label.id}
              sx={{position: 'relative'}}
              onClick={() => openEditDialog(label)}
            >
              <IssueLabelToken
                id={label.id}
                text={label.name}
                fillColor={`#${label.color}`}
                size="large"
                isSelected={hoveredId === label.id}
              />
              <Box
                sx={{
                  cursor: 'pointer',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                onMouseEnter={() => setHoveredId(label.id)}
                onMouseLeave={() => setHoveredId('')}
              />
            </Stack.Item>
          ))}

          <Stack.Item onClick={openCreateDialog}>
            <CounterLabel sx={{color: 'white', bg: 'success.emphasis', cursor: 'pointer'}}>
              <PlusIcon size={16} />
            </CounterLabel>
          </Stack.Item>
        </Stack>
      </Dialog>

      {isEditDialogOpen && (
        <LabelEditDialog
          onClose={closeEditDialog}
          label={editingLabel}
          allLabelName={allLabelName}
          onSave={handleSave}
          onDelete={editingLabel?.name ? handleDelete : undefined}
          isSaving={isSaving}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
