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
import {message} from 'antd'

import 'bytemd/dist/index.min.css'

interface EditorProps {
  title: string
  number: number
  content: string
  labels: any[]
  totalLabels: any[]
  placeholder: string
  onUpdateTitle: (title: string) => void
  onUpdateBody: (body: string) => void
  onAddLabel: (label: any) => void
  onRemoveLabel: (label: any) => void
  onUpload: (files: FileList) => Promise<any>
  isUploading: boolean
}

export default function Editor({
  title,
  number,
  content,
  labels,
  totalLabels,
  placeholder,
  onUpdateTitle,
  onUpdateBody,
  onAddLabel,
  onRemoveLabel,
  onUpload,
}: EditorProps) {
  const handleChange = (item, checked) => {
    if (checked) {
      onAddLabel(item)
    } else {
      onRemoveLabel(item)
    }
  }

  const copyLink = () => {
    const link = content || ''
    navigator.clipboard.writeText(link)
    message.success('Link copied.')
  }

  return (
    <>
      <div className="app-title">
        <TextInput
          className="title-input"
          placeholder="Title"
          value={title}
          onChange={e => onUpdateTitle(e.target.value)}
        />
        {!!number && (
          <div className="number" onClick={copyLink}>
            #{number}
          </div>
        )}
      </div>
      <div className="app-labels">
        <Stack direction="horizontal" gap="condensed" wrap="wrap">
          {totalLabels.map((label: any) => {
            const checked = labels.some(l => l.id === label.id || l.node_id === label.node_id)
            return (
              <Label
                key={label.id}
                size="small"
                variant={checked ? 'accent' : 'secondary'}
                onClick={() => {
                  handleChange(label, !checked)
                }}
              >
                {label.name}
              </Label>
            )
          })}
        </Stack>
      </div>
      <MDEditor
        value={content}
        onChange={onUpdateBody}
        uploadImages={onUpload}
        placeholder={placeholder}
      />
    </>
  )
}

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

function MDEditor({value, onChange, uploadImages, placeholder}) {
  return (
    <BytemdEditor
      placeholder={placeholder}
      plugins={plugins}
      previewDebounce={50}
      uploadImages={uploadImages}
      value={value}
      onChange={onChange}
    />
  )
}
