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
import {useToast} from '@/hooks/use-toast'

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

interface EditorProps {
  issue: MinimalIssue
  allLabel: MinimalLabels | undefined
  isLoadingLabels: boolean
  onTitleChange: (title: string) => void
  onBodyChange: (body: string) => void
  onAddLabel: (label: MinimalLabel) => void
  onRemoveLabel: (label: MinimalLabel) => void
  onUploadImages: ClientUploadImages
}

export default function Editor({
  issue,
  allLabel,
  isLoadingLabels,
  onTitleChange,
  onBodyChange,
  onAddLabel,
  onRemoveLabel,
  onUploadImages,
}: EditorProps) {
  const toast = useToast()

  const copyLink = () => {
    navigator.clipboard.writeText(issue.url)
    toast.success('Link copied.')
  }

  return (
    <Stack className="app" gap="condensed" padding="condensed">
      <Stack.Item sx={{flexShrink: 0}}>
        <Stack direction="horizontal" align="center" gap="condensed">
          <Stack.Item grow>
            <TextInput
              block
              placeholder="Title"
              value={issue.title}
              onChange={e => onTitleChange(e.target.value)}
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
          {isLoadingLabels ? (
            <SkeletonText className="app-labels-skeleton" />
          ) : (
            <Stack direction="horizontal" gap="condensed" wrap="wrap">
              {allLabel?.map(label => {
                const checked = issue.labels.some(l => l.id === label.id)
                return (
                  <Label
                    key={label.id}
                    size="small"
                    variant={checked ? 'accent' : 'secondary'}
                    onClick={() => (!checked ? onAddLabel(label) : onRemoveLabel(label))}
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
      <Stack.Item grow className="app-editor">
        <BytemdEditor
          placeholder="Leave your thought here..."
          plugins={plugins}
          previewDebounce={50}
          uploadImages={onUploadImages}
          value={issue.body}
          onChange={onBodyChange}
        />
      </Stack.Item>
    </Stack>
  )
}
