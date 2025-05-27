import 'github-markdown-css'

import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'
import {ActionBar, Editor, Labels, Posts} from '@/components'
import {MESSAGE_TYPE} from '@/constants'
import {useCreateIssue, useIssues, useLabels, useUpdateIssue, useUploadImages} from '@/hooks'
import {useToast} from '@/hooks/use-toast'
import {useEditorStore} from '@/stores/use-editor-store'
import {getRepo, rpc} from '@/utils/rpc'

import '@/app.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTitle, setFilterTitle] = useState('')
  const [filterLabels, setFilterLabels] = useState<string[]>([])
  const issue = useEditorStore(state => state.issue)
  const setIssue = useEditorStore(state => state.setIssue)
  const setTitle = useEditorStore(state => state.setTitle)
  const setBody = useEditorStore(state => state.setBody)
  const addLabel = useEditorStore(state => state.addLabel)
  const removeLabel = useEditorStore(state => state.removeLabel)
  const isIssueChanged = useEditorStore(state => state.isChanged)

  const [postsVisible, setPostsVisible] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)

  const {data: repo} = useQuery({
    queryKey: ['repo'],
    queryFn: () => getRepo(),
    gcTime: Infinity,
    staleTime: Infinity,
  })

  const {issues, issueCount, issueCountWithFilter, issueStatus} = useIssues({
    page: currentPage,
    labelNames: filterLabels,
    title: filterTitle,
  })
  const {mutateAsync: createIssue} = useCreateIssue()
  const {mutateAsync: updateIssue} = useUpdateIssue()
  const {data: allLabel, isLoading: isLoadingLabels} = useLabels()
  const {upload: handleUploadImages} = useUploadImages()

  const toast = useToast()

  useEffect(() => {
    const showSuccess = (res: string) => toast.success(res)
    const showError = (res: string) => toast.critical(res)

    rpc.on(MESSAGE_TYPE.SHOW_SUCCESS, showSuccess)
    rpc.on(MESSAGE_TYPE.SHOW_ERROR, showError)
  }, [])

  const onIssueUpdate = async () => {
    const {number} = issue

    // create
    if (number === -1) {
      const data = await createIssue(issue)
      if (data) {
        setIssue({
          ...issue,
          number: data.number,
          url: data.url,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })
      }
      return
    }

    // update
    const data = await updateIssue(issue)
    if (data) {
      setIssue({...issue, updatedAt: data.updatedAt})
    }
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

  return (
    <div className="app">
      <Editor
        issue={issue}
        allLabel={allLabel}
        isLoadingLabels={isLoadingLabels}
        isIssueChanged={isIssueChanged}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onAddLabel={addLabel}
        onRemoveLabel={removeLabel}
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
        onSetPostsVisible={onPostsVisibleChange}
      />
      <Labels
        allLabel={allLabel}
        visible={labelsVisible}
        onSetLabelsVisible={onLabelsVisibleChange}
      />
      <ActionBar
        onUpdateIssue={onIssueUpdate}
        onSetLabelsVisible={onLabelsVisibleChange}
        onSetPostsVisible={onPostsVisibleChange}
      />
    </div>
  )
}
