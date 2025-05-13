import {PlusIcon} from '@primer/octicons-react'
import {CounterLabel, Dialog, IssueLabelToken, Stack} from '@primer/react'

interface LabelsProps {
  allLabel: MinimalLabels
  visible: boolean
  isPendingLabels: boolean
  onLabelCreate: (label: string) => Promise<void>
  onLabelDelete: (label: string) => Promise<void>
  onLabelUpdate: (oldLabel: string, newLabel: string) => Promise<void>
  onSetLabelsVisible: (visible: boolean) => void
}

export default function Labels({allLabel, visible, onSetLabelsVisible}: LabelsProps) {
  // 检查是否存在重复的标签

  if (!visible) return null

  return (
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
          <Stack.Item>
            <IssueLabelToken
              key={label.id}
              id={label.id}
              text={label.name}
              fillColor={`#${label.color}`}
              size="large"
              as="button"
            />
          </Stack.Item>
        ))}

        <Stack.Item>
          <CounterLabel sx={{color: 'white', bg: 'success.emphasis'}}>
            <PlusIcon size={16} />
          </CounterLabel>
        </Stack.Item>
      </Stack>
    </Dialog>
  )
}
