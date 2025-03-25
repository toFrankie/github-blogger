import {Editor, Viewer} from '@bytemd/react'
import {Input, message} from 'antd'
import frontmatter from '@bytemd/plugin-frontmatter'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import breaks from '@bytemd/plugin-breaks'
import gemoji from '@bytemd/plugin-gemoji'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
import {Label, Stack} from '@primer/react'

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

export function MDEditor({value, setValue, uploadImages, placeholder}) {
  return (
    <Editor
      placeholder={placeholder}
      plugins={plugins}
      previewDebounce={50}
      uploadImages={uploadImages}
      value={value}
      onChange={v => setValue(v)}
    />
  )
}

export function MDViewer({value}) {
  return <Viewer value={value} />
}

export default function ContentEditor({
  title,
  number,
  content,
  labels,
  totalLabels,
  placeholder,
  uploadImages,
  store,
}) {
  const handleChange = (item, checked) => {
    if (checked) {
      store.addLabel(item)
    } else {
      store.removeLabel(item)
    }
  }

  const copyLink = () => {
    const link = store.current.html_url || store.current.url
    navigator.clipboard.writeText(link)
    message.success('Link copied.')
  }

  return (
    <>
      <div className="app-title">
        <Input
          placeholder="Title"
          value={title}
          onChange={e => store.updateTitle(e.target.value)}
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
      <Editor
        placeholder={placeholder}
        plugins={plugins}
        previewDebounce={50}
        uploadImages={uploadImages}
        value={content ?? ''}
        onChange={v => store.setCurrentIssueBody(v)}
      />
    </>
  )
}
