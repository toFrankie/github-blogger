import 'github-markdown-css'

import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'
import {ActionBar, Editor, Labels, Posts} from '@/components'
import {MESSAGE_TYPE} from '@/constants'
import {useIssues, useLabels, useUploadImages} from '@/hooks'
import {useToast} from '@/hooks/use-toast'
import {getRepo, rpc} from '@/utils/rpc'

import '@/app.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTitle, setFilterTitle] = useState('')
  const [filterLabels, setFilterLabels] = useState<string[]>([])

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
  const {data: allLabel, isLoading: isLoadingLabels} = useLabels()
  const {upload: handleUploadImages} = useUploadImages()

  const toast = useToast()

  useEffect(() => {
    const showSuccess = (res: string) => toast.success(res)
    const showError = (res: string) => toast.critical(res)

    rpc.on(MESSAGE_TYPE.SHOW_SUCCESS, showSuccess)
    rpc.on(MESSAGE_TYPE.SHOW_ERROR, showError)
  }, [])

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
        allLabel={allLabel}
        isLoadingLabels={isLoadingLabels}
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
        onSetLabelsVisible={onLabelsVisibleChange}
        onSetPostsVisible={onPostsVisibleChange}
      />
    </div>
  )
}
