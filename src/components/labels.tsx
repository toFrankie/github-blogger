import {PlusOutlined} from '@ant-design/icons'
import {Box, CounterLabel, Dialog, IssueLabelToken, Stack} from '@primer/react'
import {Input, message, Tag, Tooltip} from 'antd'
import {useRef, useState} from 'react'

interface LabelsProps {
  allLabel: MinimalLabels
  visible: boolean
  isPendingLabels: boolean
  onLabelCreate: (label: string) => Promise<void>
  onLabelDelete: (label: string) => Promise<void>
  onLabelUpdate: (oldLabel: string, newLabel: string) => Promise<void>
  onSetLabelsVisible: (visible: boolean) => void
}

export default function Labels({
  allLabel,
  visible,
  onLabelCreate,
  onLabelDelete,
  onLabelUpdate,
  onSetLabelsVisible,
}: LabelsProps) {
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
    await onLabelUpdate(label.name, editValue)
    reset()
  }

  // @ts-ignore TODO:
  const handleDelete = (label: MinimalLabel) => {
    onLabelDelete(label.name)
  }

  const handleInputConfirm = async () => {
    if (checkDuplicate(text)) return await message.error(`Label: "${text}" already exists!`)
    if (checkEmpty(text)) {
      reset()
      return
    }
    await onLabelCreate(text)
    reset()
  }

  const reset = () => {
    setInputVisible(false)
    setEditIndex('')
    setEditValue('')
    setText('')
  }

  const checkDuplicate = (name: string) => {
    return allLabel.filter(item => item.name === name).length > 0
  }

  const checkEmpty = (name: string) => {
    return name.trim() === ''
  }

  if (!visible) return null

  return (
    <Dialog
      title={
        <Stack justify="space-between" align="center" direction="horizontal">
          <Box>
            Labels
            <CounterLabel sx={{ml: 1, color: 'fg.muted'}}>{allLabel.length}</CounterLabel>
          </Box>
        </Stack>
      }
      position="right"
      width="medium"
      onClose={() => onSetLabelsVisible(false)}
    >
      <Stack gap="condensed" direction="horizontal" wrap="wrap">
        {allLabel.map(label => {
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
          // const tagElem = (
          //   <Tag
          //     key={label.name}
          //     closable
          //     onClose={() => {
          //       handleDelete(label)
          //     }}
          //   >
          //     <span
          //       onDoubleClick={e => {
          //         setEditIndex(label.id)
          //         setEditValue(label.name)
          //         setTimeout(() => {
          //           saveEditInputRef.current?.focus()
          //         }, 0)
          //         e.preventDefault()
          //       }}
          //     >
          //       {isLongLabel ? `${label.name.slice(0, 20)}...` : label.name}
          //     </span>
          //   </Tag>
          // )
          const tagElem = (
            <IssueLabelToken
              key={label.id}
              id={label.id}
              text={label.name}
              fillColor={`#${label.color}`}
              size="large"
              as="button"
            />
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

        {/* <CounterLabel sx={{ml: 1, color: 'white', bg: 'success.emphasis'}}>
          <PlusIcon size={16} />
        </CounterLabel> */}

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
      </Stack>
    </Dialog>
  )
}
