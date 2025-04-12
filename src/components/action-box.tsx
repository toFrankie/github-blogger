import {
  CloudIcon,
  LinkExternalIcon,
  ListUnorderedIcon,
  PlusIcon,
  TagIcon,
} from '@primer/octicons-react'
import {IconButton, Stack} from '@primer/react'
import {RPC_COMMANDS} from '@/constants'
import {getVscode} from '@/utils'

const vscode = getVscode()

interface ActionBoxProps {
  number: number
  onUpdateIssue: () => Promise<void>
  onSetCurrentIssue: (issue: any) => void
  onSetLabelVisible: (visible: boolean) => void
  onSetListVisible: (visible: boolean) => void
  currentIssue: any
}

export default function ActionBox({
  number,
  onUpdateIssue,
  onSetCurrentIssue,
  onSetLabelVisible,
  onSetListVisible,
  currentIssue,
}: ActionBoxProps) {
  return (
    <div className="app-action-box">
      <Stack gap="condensed">
        <IconButton
          icon={CloudIcon}
          onClick={onUpdateIssue}
          description="Update current issue"
          aria-label="Update current issue"
          tooltipDirection="w"
          variant="primary"
        />
        <IconButton
          icon={PlusIcon}
          onClick={() => onSetCurrentIssue({})}
          description="Create new issue"
          aria-label="Create new issue"
          tooltipDirection="w"
        />
        {!!number && (
          <IconButton
            icon={LinkExternalIcon}
            onClick={() => {
              vscode.postMessage({
                command: RPC_COMMANDS.OPEN_EXTERNAL_LINK,
                externalLink: currentIssue.html_url || currentIssue.url,
              })
            }}
            description="Open in default browser"
            aria-label="Open in default browser"
            tooltipDirection="w"
          />
        )}
        <IconButton
          icon={TagIcon}
          onClick={() => onSetLabelVisible(true)}
          description="Labels"
          aria-label="Labels"
          tooltipDirection="w"
        />
        <IconButton
          icon={ListUnorderedIcon}
          onClick={() => onSetListVisible(true)}
          description="Issue List"
          aria-label="Issue List"
          tooltipDirection="w"
        />
      </Stack>
    </div>
  )
}
