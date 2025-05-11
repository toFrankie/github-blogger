import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {useMemo} from 'react'
import {SUBMIT_TYPE} from '@/constants'
import {
  archiveIssue,
  createIssue,
  getIssueCount,
  getIssueCountWithFilter,
  getIssues,
  getPageCursor,
  updateIssue,
} from '@/utils/rpc'

interface UseIssuesParams {
  page: number
  LabelNames?: string[]
  title?: string
}

export default function useIssues({page, LabelNames = [], title = ''}: UseIssuesParams) {
  const queryClient = useQueryClient()

  const {data: targetCursor, isLoading: isCursorLoading} = useQuery({
    queryKey: ['issues', 'cursor', page, LabelNames, title],
    queryFn: () => getPageCursor(page),
    enabled: page > 1,
  })

  const {
    data: issues,
    isLoading: isLoadingIssues,
    isPending: isPendingIssues,
  } = useQuery({
    queryKey: ['issues', 'list', targetCursor, LabelNames, title],
    queryFn: () => getIssues(page, LabelNames, title),
    enabled: !isCursorLoading && (!!targetCursor || page === 1),
  })

  const {data: issueCount, isFetched: isFetchedIssueCount} = useQuery({
    queryKey: ['issue-count', 'total'],
    queryFn: () => getIssueCount(),
  })

  const withFilter = useMemo(() => {
    return !!title || LabelNames.length > 0
  }, [title, LabelNames])

  const {data: issueCountWithFilter, isPending: isPendingIssueCountWithFilter} = useQuery({
    queryKey: ['issue-count', 'filtered', LabelNames, title],
    queryFn: () => getIssueCountWithFilter(title, LabelNames),
    enabled: withFilter,
  })

  // TODO: 将所有 issues 或 issueCount 查询失效
  const createIssueMutation = useMutation({
    mutationFn: (issue: MinimalIssue) => createIssue(issue),
    onSuccess: async data => {
      if (!data) return // 创建失败

      await archiveIssue(data, SUBMIT_TYPE.CREATE)
      queryClient.invalidateQueries({queryKey: ['issues']}) // TODO:
      message.success('Issue created successfully')
    },
    onError: () => {
      message.error('Failed to create issue')
    },
  })

  const updateIssueMutation = useMutation({
    mutationFn: (issue: MinimalIssue) => updateIssue(issue),
    onSuccess: async data => {
      if (!data) return // 更新失败

      await archiveIssue(data, SUBMIT_TYPE.UPDATE)
      queryClient.invalidateQueries({queryKey: ['issues']}) // TODO:
      message.success('Issue updated successfully')
    },
    onError: () => {
      message.error('Failed to update issue')
    },
  })

  const withoutIssue = useMemo(() => {
    return isFetchedIssueCount && issueCount === 0
  }, [isFetchedIssueCount, issueCount])

  const isLoading = useMemo(
    () => isCursorLoading || isLoadingIssues,
    [isCursorLoading, isLoadingIssues]
  )

  const isPending = useMemo(() => {
    return isPendingIssues || (withFilter && isPendingIssueCountWithFilter)
  }, [isPendingIssues, withFilter, isPendingIssueCountWithFilter])

  const issueStatus = useMemo(
    () => ({withoutIssue, isLoading, isPending, withFilter}),
    [withoutIssue, isLoading, isPending, withFilter]
  )

  return {
    issues,
    issueCount, // 总数量
    issueCountWithFilter, // 过滤后的数量
    issueStatus,
    createIssue: createIssueMutation.mutateAsync,
    updateIssue: updateIssueMutation.mutateAsync,
  }
}
