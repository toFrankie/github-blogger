import {
  CloudIcon,
  LinkExternalIcon,
  ListUnorderedIcon,
  PlusIcon,
  TagIcon,
} from '@primer/octicons-react'
import {IconButton, Stack} from '@primer/react'
import {cloneDeep} from 'licia'
import {useMemo, useState} from 'react'
import {EMPTY_ISSUE, MESSAGE_TYPE} from '@/constants'
import {useUnsavedChangesConfirm} from '@/hooks/use-unsaved-changes-confirm'
import {getVscode} from '@/utils'

const vscode = getVscode()

interface ActionBoxProps {
  issue: MinimalIssue
  isIssueChanged: boolean
  onUpdateIssue: () => Promise<void>
  onSetCurrentIssue: (issue: MinimalIssue) => void
  onSetLabelsVisible: (visible: boolean) => void
  onSetPostsVisible: (visible: boolean) => void
}

export default function ActionBar({
  issue,
  onUpdateIssue,
  isIssueChanged,
  onSetCurrentIssue,
  onSetLabelsVisible,
  onSetPostsVisible,
}: ActionBoxProps) {
  const [isSaving, setIsSaving] = useState(false)
  const canSubmit = useMemo(
    () => issue.title && issue.body && isIssueChanged,
    [issue, isIssueChanged]
  )

  const handleSave = async () => {
    setIsSaving(true)
    onUpdateIssue().finally(() => {
      setIsSaving(false)
    })
  }

  const handleWithUnsavedChanges = useUnsavedChangesConfirm({
    onConfirm: () => onSetCurrentIssue(cloneDeep(EMPTY_ISSUE)),
  })

  return (
    <Stack className="app-action-bar" gap="condensed">
      <IconButton
        icon={CloudIcon}
        onClick={handleSave}
        disabled={!canSubmit || isSaving}
        description="Save"
        aria-label="Save"
        tooltipDirection="w"
        variant="primary"
        loading={isSaving}
      />
      <IconButton
        icon={PlusIcon}
        onClick={() => handleWithUnsavedChanges(isIssueChanged)}
        disabled={isSaving}
        description="Create new issue"
        aria-label="Create new issue"
        tooltipDirection="w"
      />
      {issue.number > -1 && (
        <IconButton
          icon={LinkExternalIcon}
          onClick={() => {
            vscode.postMessage({
              command: MESSAGE_TYPE.OPEN_EXTERNAL_LINK,
              externalLink: issue.url,
            })
          }}
          description="Open in default browser"
          aria-label="Open in default browser"
          tooltipDirection="w"
        />
      )}
      <IconButton
        icon={TagIcon}
        onClick={() => onSetLabelsVisible(true)}
        description="Labels"
        aria-label="Labels"
        tooltipDirection="w"
      />
      <IconButton
        icon={ListUnorderedIcon}
        onClick={() => onSetPostsVisible(true)}
        description="Posts"
        aria-label="Posts"
        tooltipDirection="w"
      />
    </Stack>
  )
}
