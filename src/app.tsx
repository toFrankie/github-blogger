import 'github-markdown-css'

import {useQuery} from '@tanstack/react-query'
import {message} from 'antd'
import {Buffer} from 'buffer'
import {cloneDeep} from 'licia-es'
import {useEffect, useState} from 'react'
import {ActionBar, Editor, Labels, Posts} from '@/components'
import {EMPTY_ISSUE, MESSAGE_TYPE} from '@/constants'
import {useIssues, useLabels, useUploadImages} from '@/hooks'
import {compareIssue} from '@/utils'
import {getRepo, RPC} from '@/utils/rpc'

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
  const [current, setCurrent] = useState<MinimalIssue>(cloneDeep(EMPTY_ISSUE))
  const [originalCurrent, setOriginalCurrent] = useState<MinimalIssue>(cloneDeep(EMPTY_ISSUE))
  const [listVisible, setListVisible] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)

  const {data: repo} = useQuery({
    queryKey: ['repo'],
    queryFn: () => getRepo(),
  })

  const {issues, issueCount, createIssue, updateIssue, issueStatus} = useIssues({
    page: currentPage,
    LabelNames: filterLabels,
    title: filterTitle,
  })
  const {labels: allLabel, isPendingLabels, createLabel, deleteLabel, updateLabel} = useLabels()
  const {upload: handleUploadImages} = useUploadImages()

  useEffect(() => {
    RPC.on(MESSAGE_TYPE.SHOW_SUCCESS, showSuccess)
    RPC.on(MESSAGE_TYPE.SHOW_ERROR, showError)
  }, [])

  const handleUpdateIssue = async () => {
    const {number, title, body} = current
    if (!title || !body) {
      message.error('Please enter the content...')
      return
    }

    // create
    if (number === -1) {
      const data = await createIssue(current)
      if (data) {
        setCurrent(prev => ({
          ...prev,
          number: data.number,
          url: data.url,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }))
        setOriginalCurrent(cloneDeep(current))
      }
      return
    }

    // check diff
    const isDiff = compareIssue(current, originalCurrent)
    if (!isDiff) {
      message.warning('No changes made.')
      return
    }

    // update
    const data = await updateIssue(current)
    if (data) {
      setCurrent(prev => ({...prev, updatedAt: data.updatedAt}))
      setOriginalCurrent(cloneDeep(current))
    }
  }

  const handleSetCurrentIssue = (issue: any) => {
    setCurrent(issue)
    setOriginalCurrent(cloneDeep(issue))
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

  const handleCreateLabel = async (label: string) => {
    try {
      await createLabel(label)
    } catch (error) {
      console.error('Create label failed:', error)
    }
  }

  const handleDeleteLabel = async (label: string) => {
    try {
      await deleteLabel(label)
    } catch (error) {
      console.error('Delete label failed:', error)
    }
  }

  const handleUpdateLabel = async (oldLabel: string, newLabel: string) => {
    try {
      await updateLabel({oldLabel, newLabel})
    } catch (error) {
      console.error('Update label failed:', error)
    }
  }

  return (
    <div className="app">
      <Editor
        issue={current}
        allLabel={allLabel}
        isPendingLabels={isPendingLabels}
        onTitleChange={title => setCurrent(prev => ({...prev, title}))}
        onBodyChange={body => setCurrent(prev => ({...prev, body}))}
        onAddLabel={label => setCurrent(prev => ({...prev, labels: prev.labels.concat(label)}))}
        onRemoveLabel={label =>
          setCurrent(prev => ({...prev, labels: prev.labels.filter(item => item.id !== label.id)}))
        }
        onUploadImages={handleUploadImages}
      />
      <Posts
        repo={repo}
        currentPage={currentPage}
        issueStatus={issueStatus}
        issueCount={issueCount}
        allLabel={allLabel}
        visible={listVisible}
        issues={issues}
        onSetCurrentPage={handleSetCurrentPage}
        onSetFilterTitle={handleSetFilterTitle}
        onSetFilterLabels={handleSetFilterLabels}
        onSetCurrentIssue={handleSetCurrentIssue}
        onSetListVisible={handleSetListVisible}
      />
      <Labels
        allLabel={allLabel}
        visible={labelsVisible}
        isPendingLabels={isPendingLabels}
        onCreateLabel={handleCreateLabel}
        onDeleteLabel={handleDeleteLabel}
        onUpdateLabel={handleUpdateLabel}
        onSetLabelsVisible={handleSetLabelsVisible}
      />
      <ActionBar
        issue={current}
        onUpdateIssue={handleUpdateIssue}
        onSetCurrentIssue={handleSetCurrentIssue}
        onSetLabelVisible={handleSetLabelsVisible}
        onSetListVisible={handleSetListVisible}
      />
    </div>
  )
}
