import {Editor, Viewer} from '@bytemd/react'
import {Input, Tag, Space, message} from 'antd'
import frontmatter from '@bytemd/plugin-frontmatter'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import breaks from '@bytemd/plugin-breaks'
import gemoji from '@bytemd/plugin-gemoji'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'

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
        <Space wrap size={[0, 'small']}>
          {totalLabels.map(item => (
            <Tag.CheckableTag
              key={item.id}
              checked={labels.some(label => label.id === item.id || label.id === item.node_id)}
              onChange={checked => handleChange(item, checked)}
            >
              {item.name}
            </Tag.CheckableTag>
          ))}
        </Space>
      </div>
      <Editor
        placeholder={placeholder}
        plugins={plugins}
        previewDebounce={50}
        uploadImages={uploadImages}
        value={content || ''}
        onChange={v => store.setCurrentIssueBody(v)}
      />
    </>
  )
}
