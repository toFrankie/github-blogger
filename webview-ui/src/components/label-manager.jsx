import {useState, useRef} from 'react'
import {Drawer, Input, Tooltip, Tag, message} from 'antd'
import {PlusOutlined} from '@ant-design/icons'

export default function TagsManager({store, visible, labels}) {
  const [text, setText] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editIndex, setEditIndex] = useState()
  const [inputVisible, setInputVisible] = useState(false)
  const saveEditInputRef = useRef(null)
  const saveInputRef = useRef(null)

  const handleEditInputConfirm = async tag => {
    if (checkDuplicate(editValue) || checkEmpty(editValue)) return reset()
    await store.updateLabel(tag.name, editValue)
    reset()
  }

  const handleClose = tag => {
    store.deleteLabel(tag.name)
  }

  const handleInputConfirm = async () => {
    if (checkDuplicate(text)) return message.error(`Tag: "${text}" already exists!`)
    if (checkEmpty(text)) return reset()
    await store.createLabel(text)
    reset()
  }

  const reset = () => {
    setInputVisible(false)
    setEditIndex(undefined)
    setEditValue('')
    setText('')
  }

  const checkDuplicate = name => {
    return labels.filter(item => item.name === name).length > 0
  }

  const checkEmpty = name => {
    return name.trim() === ''
  }

  return (
    <Drawer
      closable={false}
      placement="right"
      title="Tags Management"
      visible={visible}
      onClose={() => store.setTagsVisible(false)}
    >
      <>
        {labels.map(label => {
          if (label.id === editIndex) {
            return (
              <Input
                key={label.id}
                ref={saveEditInputRef}
                className="tag-input"
                size="small"
                value={editValue}
                onBlur={() => handleEditInputConfirm(label)}
                onChange={e => setEditValue(e.target.value)}
                onPressEnter={() => handleEditInputConfirm(label)}
              />
            )
          }
          const isLongTag = label.name.length > 20
          const tagElem = (
            <Tag
              key={label.name}
              closable
              className="edit-tag"
              color="#1890ff"
              onClose={() => handleClose(label)}
            >
              <span
                onDoubleClick={e => {
                  setEditIndex(label.id)
                  setEditValue(label.name)
                  setTimeout(() => {
                    saveEditInputRef.current?.focus()
                  }, 0)
                  e.preventDefault()
                }}
              >
                {isLongTag ? `${label.name.slice(0, 20)}...` : label.name}
              </span>
            </Tag>
          )
          return isLongTag ? (
            <Tooltip key={label.id} title={label}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          )
        })}
        {inputVisible && (
          <Input
            ref={saveInputRef}
            className="tag-input"
            size="small"
            type="text"
            value={text}
            onBlur={handleInputConfirm}
            onChange={e => setText(e.target.value)}
            onPressEnter={handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag
            className="site-tag-plus"
            onClick={() => {
              setInputVisible(true)
              setTimeout(() => {
                saveInputRef.current?.focus()
              }, 0)
            }}
          >
            <PlusOutlined /> New Tag
          </Tag>
        )}
      </>
    </Drawer>
  )
}