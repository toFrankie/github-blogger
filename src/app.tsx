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
  const [currentIssue, setCurrentIssue] = useState<MinimalIssue>(cloneDeep(EMPTY_ISSUE))
  const [currentIssueOriginal, setCurrentIssueOriginal] = useState<MinimalIssue>(
    cloneDeep(EMPTY_ISSUE)
  )
  const [postsVisible, setPostsVisible] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)

  const {data: repo} = useQuery({
    queryKey: ['repo'],
    queryFn: () => getRepo(),
  })

  const {issues, issueCount, issueCountWithFilter, createIssue, updateIssue, issueStatus} =
    useIssues({
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

  const onIssueUpdate = async () => {
    const {number, title, body} = currentIssue
    if (!title || !body) {
      message.error('Please enter the content...')
      return
    }

    // create
    if (number === -1) {
      const data = await createIssue(currentIssue)
      if (data) {
        setCurrentIssue(prev => ({
          ...prev,
          number: data.number,
          url: data.url,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }))
        setCurrentIssueOriginal(cloneDeep(currentIssue))
      }
      return
    }

    // check diff
    const isDiff = compareIssue(currentIssue, currentIssueOriginal)
    if (!isDiff) {
      message.warning('No changes made.')
      return
    }

    // update
    const data = await updateIssue(currentIssue)
    if (data) {
      setCurrentIssue(prev => ({...prev, updatedAt: data.updatedAt}))
      setCurrentIssueOriginal(cloneDeep(currentIssue))
    }
  }

  const onCurrentIssueChange = (issue: any) => {
    setCurrentIssue(issue)
    setCurrentIssueOriginal(cloneDeep(issue))
  }

  const onPostsVisibleChange = (visible: boolean) => {
    setPostsVisible(visible)
  }

  const onLabelsVisibleChange = (visible: boolean) => {
    setLabelsVisible(visible)
  }

  const onCurrentPageChange = (page: number) => {
    setCurrentPage(page)
  }

  const onFilterTitleChange = (title: string) => {
    setFilterTitle(title)
  }

  const onFilterLabelChange = (labels: string[]) => {
    setFilterLabels(labels)
  }

  const onLabelCreate = async (label: string) => {
    try {
      await createLabel(label)
    } catch (error) {
      console.error('Create label failed:', error)
    }
  }

  const onLabelDelete = async (label: string) => {
    try {
      await deleteLabel(label)
    } catch (error) {
      console.error('Delete label failed:', error)
    }
  }

  const onLabelUpdate = async (oldLabel: string, newLabel: string) => {
    try {
      await updateLabel({oldLabel, newLabel})
    } catch (error) {
      console.error('Update label failed:', error)
    }
  }

  return (
    <div className="app">
      <Editor
        issue={currentIssue}
        allLabel={allLabel}
        isPendingLabels={isPendingLabels}
        onTitleChange={title => setCurrentIssue(prev => ({...prev, title}))}
        onBodyChange={body => setCurrentIssue(prev => ({...prev, body}))}
        onAddLabel={label =>
          setCurrentIssue(prev => ({...prev, labels: prev.labels.concat(label)}))
        }
        onRemoveLabel={label =>
          setCurrentIssue(prev => ({
            ...prev,
            labels: prev.labels.filter(item => item.id !== label.id),
          }))
        }
        onUploadImages={handleUploadImages}
      />
      <Posts
        repo={repo}
        currentPage={currentPage}
        issueStatus={issueStatus}
        issueCount={issueCount}
        issueCountWithFilter={issueCountWithFilter}
        allLabel={allLabel}
        visible={postsVisible}
        issues={issues}
        onSetCurrentPage={onCurrentPageChange}
        onSetFilterTitle={onFilterTitleChange}
        onSetFilterLabels={onFilterLabelChange}
        onSetCurrentIssue={onCurrentIssueChange}
        onSetPostsVisible={onPostsVisibleChange}
      />
      <Labels
        allLabel={allLabel}
        visible={labelsVisible}
        isPendingLabels={isPendingLabels}
        onLabelCreate={onLabelCreate}
        onLabelDelete={onLabelDelete}
        onLabelUpdate={onLabelUpdate}
        onSetLabelsVisible={onLabelsVisibleChange}
      />
      <ActionBar
        issue={currentIssue}
        onUpdateIssue={onIssueUpdate}
        onSetCurrentIssue={onCurrentIssueChange}
        onSetLabelsVisible={onLabelsVisibleChange}
        onSetPostsVisible={onPostsVisibleChange}
      />
    </div>
  )
}
