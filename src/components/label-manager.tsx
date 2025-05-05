import {PlusOutlined} from '@ant-design/icons'
import {Drawer, Input, message, Space, Tag, Tooltip} from 'antd'
import {useRef, useState} from 'react'

interface LabelManagerProps {
  labels: MinimalLabels
  visible: boolean
  loading: boolean
  onCreateLabel: (label: string) => Promise<void>
  onDeleteLabel: (label: string) => Promise<void>
  onUpdateLabel: (oldLabel: string, newLabel: string) => Promise<void>
  onSetLabelsVisible: (visible: boolean) => void
}

export default function LabelManager({
  labels,
  visible,
  onCreateLabel,
  onDeleteLabel,
  onUpdateLabel,
  onSetLabelsVisible,
}: LabelManagerProps) {
  const [text, setText] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editIndex, setEditIndex] = useState('')
  const [inputVisible, setInputVisible] = useState(false)
  const saveEditInputRef: any = useRef(null)
  const saveInputRef: any = useRef(null)

  const handleEditInputConfirm = async label => {
    if (checkDuplicate(editValue) || checkEmpty(editValue)) {
      reset()
      return
    }
    await onUpdateLabel(label.name, editValue)
    reset()
  }

  const handleDelete = (label: MinimalLabel) => {
    onDeleteLabel(label.name)
  }

  const handleInputConfirm = async () => {
    if (checkDuplicate(text)) return await message.error(`Label: "${text}" already exists!`)
    if (checkEmpty(text)) {
      reset()
      return
    }
    await onCreateLabel(text)
    reset()
  }

  const reset = () => {
    setInputVisible(false)
    setEditIndex('')
    setEditValue('')
    setText('')
  }

  const checkDuplicate = (name: string) => {
    return labels.filter(item => item.name === name).length > 0
  }

  const checkEmpty = (name: string) => {
    return name.trim() === ''
  }

  if (!visible) return null

  return (
    <Drawer
      closable={false}
      open={visible}
      placement="right"
      title="Labels Management"
      onClose={() => onSetLabelsVisible(false)}
    >
      <Space wrap size={[0, 'small']}>
        {labels.map(label => {
          if (label.id === editIndex) {
            return (
              <Input
                key={label.id}
                ref={saveEditInputRef}
                className="label-input"
                size="small"
                value={editValue}
                onBlur={async () => {
                  await handleEditInputConfirm(label)
                }}
                onChange={e => {
                  setEditValue(e.target.value)
                }}
                onPressEnter={async () => {
                  await handleEditInputConfirm(label)
                }}
              />
            )
          }

          const isLongLabel = label.name.length > 20
          const tagElem = (
            <Tag
              key={label.name}
              closable
              onClose={() => {
                handleDelete(label)
              }}
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
                {isLongLabel ? `${label.name.slice(0, 20)}...` : label.name}
              </span>
            </Tag>
          )
          return isLongLabel ? (
            <Tooltip key={label.id} title={label.name}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          )
        })}

        {inputVisible && (
          <Input
            ref={saveInputRef}
            className="label-input"
            size="small"
            type="text"
            value={text}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
            onChange={e => {
              setText(e.target.value)
            }}
          />
        )}

        {!inputVisible && (
          <Tag
            className="add-label"
            onClick={() => {
              setInputVisible(true)
              setTimeout(() => {
                saveInputRef.current?.focus()
              }, 0)
            }}
          >
            <PlusOutlined /> New Label
          </Tag>
        )}
      </Space>
    </Drawer>
  )
}
