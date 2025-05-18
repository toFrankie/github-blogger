import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
import {Editor as BytemdEditor} from '@bytemd/react'
import {Label, Stack, TextInput} from '@primer/react'
import {SkeletonText} from '@primer/react/experimental'
import {message} from 'antd'

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
  const copyLink = () => {
    navigator.clipboard.writeText(issue.url)
    message.success('Link copied.')
  }

  return (
    <>
      <div className="app-title">
        <TextInput
          className="title-input"
          placeholder="Title"
          value={issue.title}
          onChange={e => onTitleChange(e.target.value)}
        />
        {issue.number > -1 && (
          <div className="number" onClick={copyLink}>
            #{issue.number}
          </div>
        )}
      </div>
      <div className="app-labels">
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
      </div>

      <BytemdEditor
        placeholder="Leave your thought here..."
        plugins={plugins}
        previewDebounce={50}
        uploadImages={onUploadImages}
        value={issue.body}
        onChange={onBodyChange}
      />
    </>
  )
}
