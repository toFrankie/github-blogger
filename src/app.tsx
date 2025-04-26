import 'github-markdown-css'

import {message} from 'antd'
import {Buffer} from 'buffer'
import {cloneDeep} from 'licia-es'
import {useEffect, useState} from 'react'
import {ActionBox, Editor, LabelManager, List} from '@/components'
import {MESSAGE_TYPE} from '@/constants'
import {useIssues, useLabels, useUpload} from '@/hooks'
import {compareIssue} from '@/utils'
import {RPC} from '@/utils/rpc'

import 'bytemd/dist/index.min.css'
import '@/app.css'
import '@/github.custom.css'
import '@/reset.css'

window.Buffer = window.Buffer ?? Buffer

const showError = async (res: string) => {
  message.error(res)
  await Promise.resolve()
}

const showSuccess = async (res: string) => {
  message.success(res)
  await Promise.resolve()
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTitle, setFilterTitle] = useState('')
  const [filterLabels, setFilterLabels] = useState<string[]>([])
  const [current, setCurrent] = useState<any>({})
  const [originalCurrent, setOriginalCurrent] = useState<any>({})
  const [listVisible, setListVisible] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)

  const {issues, totalCount, issuesLoading, createIssue, updateIssue} = useIssues({
    page: currentPage,
    LabelNames: filterLabels,
    title: filterTitle,
  })
  const {labels, labelsLoading, createLabel, deleteLabel, updateLabel} = useLabels()
  const {upload, isUploading} = useUpload()

  useEffect(() => {
    RPC.on(MESSAGE_TYPE.SHOW_SUCCESS, showSuccess)
    RPC.on(MESSAGE_TYPE.SHOW_ERROR, showError)
  }, [])

  const handleUpdateIssue = async () => {
    const {number = undefined, title = '', body = '', labels = []} = current
    if (!title || !body) {
      message.error('Please enter the content...')
      return
    }

    if (!number) {
      const data = await createIssue({title, body, labelNames: labels})
      if (data) {
        setCurrent(prev => ({
          ...prev,
          number: data.number,
          html_url: data.html_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
        }))
        setOriginalCurrent(cloneDeep(current))
      }
      return
    }

    const isDiff = compareIssue(current, originalCurrent)
    if (!isDiff) {
      message.warning('No changes made.')
      return
    }

    const data = await updateIssue({number, title, body, labelNames: labels})

    if (data) {
      setCurrent(prev => ({
        ...prev,
        updated_at: data.updated_at,
      }))
      setOriginalCurrent(cloneDeep(current))
    }
  }

  const handleAddLabel = (label: any) => {
    setCurrent(prev => ({
      ...prev,
      labels: [...(prev.labels || []), label],
    }))
  }

  const handleRemoveLabel = (label: any) => {
    setCurrent(prev => ({
      ...prev,
      labels: (prev.labels || []).filter(item => item.id !== label.id && item.id !== label.node_id),
    }))
  }

  const handleSetCurrentIssue = (issue: any) => {
    setCurrent(issue)
    setOriginalCurrent(cloneDeep(issue))
  }

  const handleSetCurrentIssueBody = (body: string) => {
    setCurrent(prev => ({
      ...prev,
      body,
    }))
  }

  const handleSetListVisible = (visible: boolean) => {
    setListVisible(visible)
  }

  const handleSetLabelsVisible = (visible: boolean) => {
    setLabelsVisible(visible)
  }

  const handleSetCurrentPage = (page: number) => {
    setCurrentPage(page)
  }

  const handleSetFilterTitle = (title: string) => {
    setFilterTitle(title)
  }

  const handleSetFilterLabels = (labels: string[]) => {
    setFilterLabels(labels)
  }

  const handleUpload = async (files: FileList) => {
    try {
      await upload(files)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleCreateLabel = async (label: any) => {
    try {
      await createLabel(label)
    } catch (error) {
      console.error('Create label failed:', error)
    }
  }

  const handleDeleteLabel = async (label: any) => {
    try {
      await deleteLabel(label)
    } catch (error) {
      console.error('Delete label failed:', error)
    }
  }

  const handleUpdateLabel = async (oldLabel: any, newLabel: any) => {
    try {
      await updateLabel({oldLabel, newLabel})
    } catch (error) {
      console.error('Update label failed:', error)
    }
  }

  return (
    <div className="app">
      <Editor
        content={current.body || ''}
        labels={current.labels || []}
        number={current.number}
        placeholder="Leave your thought..."
        title={current.title || ''}
        totalLabels={labels}
        onUpdateTitle={title => setCurrent(prev => ({...prev, title}))}
        onUpdateBody={handleSetCurrentIssueBody}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
      <List
        currentPage={currentPage}
        totalCount={totalCount}
        totalLabels={labels}
        visible={listVisible}
        issues={issues}
        loading={issuesLoading}
        onSetCurrentPage={handleSetCurrentPage}
        onSetFilterTitle={handleSetFilterTitle}
        onSetFilterLabels={handleSetFilterLabels}
        onSetCurrentIssue={handleSetCurrentIssue}
        onSetListVisible={handleSetListVisible}
      />
      <LabelManager
        labels={labels}
        visible={labelsVisible}
        loading={labelsLoading}
        onCreateLabel={handleCreateLabel}
        onDeleteLabel={handleDeleteLabel}
        onUpdateLabel={handleUpdateLabel}
        onSetLabelsVisible={handleSetLabelsVisible}
      />
      <ActionBox
        number={current.number}
        onUpdateIssue={handleUpdateIssue}
        onSetCurrentIssue={handleSetCurrentIssue}
        onSetLabelVisible={handleSetLabelsVisible}
        onSetListVisible={handleSetListVisible}
        currentIssue={current}
      />
    </div>
  )
}
