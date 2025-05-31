import {
  CloudIcon,
  LinkExternalIcon,
  ListUnorderedIcon,
  PlusIcon,
  TagIcon,
} from '@primer/octicons-react'
import {IconButton, Stack, useConfirm} from '@primer/react'
import {cloneDeep} from 'licia'
import {useMemo, useState} from 'react'
import {EMPTY_ISSUE, MESSAGE_TYPE} from '@/constants'
import {useCreateIssue, useUpdateIssue} from '@/hooks'
import {useEditorStore} from '@/stores/use-editor-store'
import {getVscode} from '@/utils'

const vscode = getVscode()

interface ActionBoxProps {
  onSetLabelsVisible: (visible: boolean) => void
  onSetPostsVisible: (visible: boolean) => void
}

export default function ActionBar({onSetLabelsVisible, onSetPostsVisible}: ActionBoxProps) {
  const issue = useEditorStore(state => state.issue)
  const isChanged = useEditorStore(state => state.isChanged)
  const canSubmit = useEditorStore(state => state.canSubmit)
  const setIssue = useEditorStore(state => state.setIssue)

  const {mutateAsync: createIssue} = useCreateIssue()
  const {mutateAsync: updateIssue} = useUpdateIssue()

  const confirm = useConfirm()

  const [isSaving, setIsSaving] = useState(false)

  const saveBtnEnabled = useMemo(
    () => canSubmit && isChanged && !isSaving,
    [canSubmit, isChanged, isSaving]
  )

  const onSave = async () => {
    setIsSaving(true)

    try {
      if (issue.number === -1) {
        const data = await createIssue(issue)
        setIssue({
          ...issue,
          number: data.number,
          url: data.url,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })
        return
      }

      const data = await updateIssue(issue)
      setIssue({...issue, updatedAt: data.updatedAt})
    } finally {
      setIsSaving(false)
    }
  }

  const onSwitch = async () => {
    if (!isChanged && issue.number === -1) return

    if (isChanged) {
      const result = await confirm({
        title: 'Tips',
        content:
          'You have unsaved changes. Creating a new issue will discard your current changes. Do you want to continue?',
        cancelButtonContent: 'Cancel',
        confirmButtonContent: 'Continue',
        confirmButtonType: 'danger',
      })
      if (!result) return
    }

    setIssue(cloneDeep(EMPTY_ISSUE))
  }

  return (
    <Stack className="app-action-bar" gap="condensed">
      <IconButton
        icon={CloudIcon}
        onClick={onSave}
        disabled={!saveBtnEnabled}
        description="Save"
        aria-label="Save"
        tooltipDirection="w"
        variant="primary"
        loading={isSaving}
      />
      <IconButton
        icon={PlusIcon}
        onClick={onSwitch}
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
        description="Issues"
        aria-label="Issues"
        tooltipDirection="w"
      />
    </Stack>
  )
}
