import {Editor, Viewer} from '@bytemd/react'
import {Input, Tag} from 'antd'
import formt from '@bytemd/plugin-frontmatter'
import gfm from '@bytemd/plugin-gfm'
import hl from '@bytemd/plugin-highlight'
import breaks from '@bytemd/plugin-breaks'

const plugins = [formt(), breaks(), gfm(), hl()]

const {CheckableTag} = Tag

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
        {totalLabels.map(item => (
          <CheckableTag
            key={item.id}
            checked={labels.filter(label => label.id === item.id).length > 0}
            onChange={checked => handleChange(item, checked)}
          >
            {item.name}
          </CheckableTag>
        ))}
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
