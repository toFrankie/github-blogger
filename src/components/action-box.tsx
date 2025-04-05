import {
  CloudIcon,
  LinkExternalIcon,
  ListUnorderedIcon,
  PlusIcon,
  TagIcon,
} from '@primer/octicons-react'
import {IconButton, Stack} from '@primer/react'
import {getVscode} from '../utils'

const vscode = getVscode()

export default function ActionBox({store, number}) {
  return (
    <div className="app-action-box">
      <Stack gap="condensed">
        <IconButton
          icon={CloudIcon}
          onClick={() => store.updateIssue()}
          description="Update current issue"
          aria-label="Update current issue"
          tooltipDirection="w"
          variant="primary"
        />
        <IconButton
          icon={PlusIcon}
          onClick={() => store.setCurrentIssue({})}
          description="Create new issue"
          aria-label="Create new issue"
          tooltipDirection="w"
        />
        {!!number && (
          <IconButton
            icon={LinkExternalIcon}
            onClick={() => {
              vscode.postMessage({
                command: 'openExternalLink',
                externalLink: store.current.html_url || store.current.url,
              })
            }}
            description="Open in default browser"
            aria-label="Open in default browser"
            tooltipDirection="w"
          />
        )}
        <IconButton
          icon={TagIcon}
          onClick={() => store.setLabelVisible(true)}
          description="Labels"
          aria-label="Labels"
          tooltipDirection="w"
        />
        <IconButton
          icon={ListUnorderedIcon}
          onClick={() => store.setListVisible(true)}
          description="Issue List"
          aria-label="Issue List"
          tooltipDirection="w"
        />
      </Stack>
    </div>
  )
}
