import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
import {Editor as BytemdEditor} from '@bytemd/react'
import {Label, Stack, Text, TextInput} from '@primer/react'
import {SkeletonText} from '@primer/react/experimental'
import {useLabels, useRepo, useToast, useUploadImages} from '@/hooks'
import {useEditorStore} from '@/stores/use-editor-store'
import {FlashWithRetry} from './flash-with-retry'

import 'bytemd/dist/index.min.css'

const plugins = [
  frontmatter(),
  breaks(),
  gfm(),
  highlight(),
  gemoji(),
  math(),
  mediumZoom(),
  mermaid(),
]

export default function Editor() {
  const toast = useToast()

  const issue = useEditorStore(state => state.issue)
  const setTitle = useEditorStore(state => state.setTitle)
  const setBody = useEditorStore(state => state.setBody)
  const addLabel = useEditorStore(state => state.addLabel)
  const removeLabel = useEditorStore(state => state.removeLabel)
  const isIssueChanged = useEditorStore(state => state.isChanged)

  const {upload: handleUploadImages} = useUploadImages()

  const {isError: isErrorRepo, refetch: refetchRepo} = useRepo()

  const {
    data: labels,
    isLoading: isLoadingLabels,
    isError: isErrorLabels,
    refetch: refetchLabels,
  } = useLabels()

  const copyLink = () => {
    navigator.clipboard.writeText(issue.url)
    toast.success('Link copied.')
  }

  return (
    <Stack className="app-editor" gap="condensed" padding="condensed">
      {isErrorRepo && (
        <Stack.Item>
          <FlashWithRetry
            message="Uh oh! Failed to load repository."
            onRetry={() => refetchRepo()}
          />
        </Stack.Item>
      )}
      <Stack.Item sx={{flexShrink: 0}}>
        <Stack direction="horizontal" align="center" gap="condensed">
          <Stack.Item grow>
            <TextInput
              block
              placeholder="Title"
              value={issue.title}
              onChange={e => setTitle(e.target.value)}
            />
          </Stack.Item>
          {issue.number > -1 && (
            <Stack.Item sx={{flexShrink: 0}}>
              <Text onClick={copyLink} sx={{color: 'fg.muted', fontSize: 2, cursor: 'pointer'}}>
                #{issue.number}
              </Text>
            </Stack.Item>
          )}
        </Stack>
      </Stack.Item>
      <Stack.Item sx={{flexShrink: 0}}>
        <>
          {isErrorLabels ? (
            <FlashWithRetry
              message="Uh oh! Failed to load labels."
              onRetry={() => refetchLabels()}
            />
          ) : isLoadingLabels ? (
            <SkeletonText className="labels-skeleton" />
          ) : (
            <Stack direction="horizontal" gap="condensed" wrap="wrap">
              {labels?.map(label => {
                const checked = issue.labels.some(l => l.id === label.id)
                return (
                  <Label
                    key={label.id}
                    size="small"
                    variant={checked ? 'accent' : 'secondary'}
                    onClick={() => (!checked ? addLabel(label) : removeLabel(label))}
                    sx={{fontSize: '11px'}}
                  >
                    {label.name}
                  </Label>
                )
              })}
            </Stack>
          )}
        </>
      </Stack.Item>
      <Stack.Item grow className={`app-bytemd ${isIssueChanged ? 'app-bytemd-changed' : ''}`}>
        <BytemdEditor
          placeholder="Leave your thought here..."
          plugins={plugins}
          previewDebounce={50}
          uploadImages={handleUploadImages}
          value={issue.body}
          onChange={setBody}
        />
      </Stack.Item>
    </Stack>
  )
}
