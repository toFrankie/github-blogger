import {
  CloudIcon,
  LinkExternalIcon,
  ListUnorderedIcon,
  PlusIcon,
  TagIcon,
} from '@primer/octicons-react'
import {IconButton, Stack} from '@primer/react'
import {cloneDeep} from 'licia-es'
import {EMPTY_ISSUE, MESSAGE_TYPE} from '@/constants'
import {getVscode} from '@/utils'

const vscode = getVscode()

interface ActionBoxProps {
  issue: MinimalIssue
  onUpdateIssue: () => Promise<void>
  onSetCurrentIssue: (issue: MinimalIssue) => void
  onSetLabelsVisible: (visible: boolean) => void
  onSetPostsVisible: (visible: boolean) => void
}

export default function ActionBar({
  issue,
  onUpdateIssue,
  onSetCurrentIssue,
  onSetLabelsVisible,
  onSetPostsVisible,
}: ActionBoxProps) {
  return (
    <Stack
      gap="condensed"
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 40,
        zIndex: 50,
      }}
    >
      <IconButton
        icon={CloudIcon}
        onClick={onUpdateIssue}
        description="Update issue"
        aria-label="Update issue"
        tooltipDirection="w"
        variant="primary"
      />
      <IconButton
        icon={PlusIcon}
        onClick={() => onSetCurrentIssue(cloneDeep(EMPTY_ISSUE))}
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
