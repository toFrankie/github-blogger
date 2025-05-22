import 'github-markdown-css'

import {useQuery} from '@tanstack/react-query'
import {cloneDeep} from 'licia'
import {useEffect, useMemo, useState} from 'react'
import {ActionBar, Editor, Labels, Posts} from '@/components'
import {EMPTY_ISSUE, MESSAGE_TYPE} from '@/constants'
import {useCreateIssue, useIssues, useLabels, useUpdateIssue, useUploadImages} from '@/hooks'
import {useToast} from '@/hooks/use-toast'
import {compareIssue} from '@/utils'
import {getRepo, rpc} from '@/utils/rpc'

import '@/app.css'

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

  const isIssueChanged = useMemo(
    () => compareIssue(currentIssue, currentIssueOriginal),
    [currentIssue, currentIssueOriginal]
  )

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
    const {number, title, body} = currentIssue
    if (!title || !body) {
      toast.critical('Please enter the content...')
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
    if (!isIssueChanged) {
      toast.warning('No changes made.')
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

  return (
    <div className="app">
      <Editor
        issue={currentIssue}
        allLabel={allLabel}
        isLoadingLabels={isLoadingLabels}
        isIssueChanged={isIssueChanged}
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
        currentIssue={currentIssue}
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
