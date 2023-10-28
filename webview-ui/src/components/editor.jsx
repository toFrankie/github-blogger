import {Editor, Viewer} from '@bytemd/react'
import {Input, Tag, Space} from 'antd'
import frontmatter from '@bytemd/plugin-frontmatter'
import gfm from '@bytemd/plugin-gfm'
import hl from '@bytemd/plugin-highlight'
import breaks from '@bytemd/plugin-breaks'
import gemoji from '@bytemd/plugin-gemoji'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'

const plugins = [frontmatter(), breaks(), gfm(), hl(), gemoji(), math(), mediumZoom(), mermaid()]

export function MDEditor({value, setValue, uploadImages, placeholder}) {
  return (
    <Editor
      placeholder={placeholder}
      plugins={plugins}
      previewDebounce={50}
      uploadImages={uploadImages}
      value={value}
      onChange={v => {
        setValue(v)
      }}
    />
  )
}

export function MDViewer({value}) {
  return <Viewer value={value} />
}

export default function ContentEditor({
  title,
  content,
  labels,
  totalLabels,
  placeholder,
  uploadImages,
  store,
}) {
  const handleChange = (item, checked) => {
    if (checked) {
      store.addTag(item)
    } else {
      store.removeTag(item)
    }
  }

  return (
    <>
      <div className="app-title">
        <Input
          placeholder="Title"
          value={title}
          onChange={e => store.updateTitle(e.target.value)}
        />
      </div>
      <div className="app-labels">
        <Space size={[0, 'small']} wrap>
          {totalLabels.map(item => (
            <Tag.CheckableTag
              key={item.id}
              checked={labels.filter(label => label.id === item.id).length > 0}
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
        onChange={v => {
          store.setCurrentIssueBody(v)
        }}
      />
    </>
  )
}
