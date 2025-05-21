import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
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
import {useToast} from './use-toast'

interface UseIssuesParams {
  page: number
  labelNames?: string[]
  title?: string
}

export function useIssues({page, labelNames = [], title = ''}: UseIssuesParams) {
  const withCursor = page > 1

  const {
    data: targetCursor,
    isLoading: isCursorLoading,
    isPending: isPendingCursor,
  } = useQuery({
    queryKey: ['issues', 'cursor', page, title, labelNames.join(',')],
    queryFn: () => getPageCursor(page, labelNames, title),
    enabled: withCursor,
    gcTime: Infinity,
    staleTime: Infinity,
  })

  // TODO: error
  const issuesEnabled = !withCursor || (withCursor && !isPendingCursor && !!targetCursor)

  const {
    data: issues,
    isLoading: isLoadingIssues,
    isPending: isPendingIssues,
  } = useQuery({
    queryKey: ['issues', 'list', page, title, labelNames.join(',')],
    queryFn: () => getIssues(targetCursor, labelNames, title),
    enabled: issuesEnabled,
  })

  const {data: issueCount, isFetched: isFetchedIssueCount} = useQuery({
    queryKey: ['issue', 'count', 'total'],
    queryFn: () => getIssueCount(),
  })

  const withFilter = useMemo(() => {
    return !!title || labelNames.length > 0
  }, [title, labelNames])

  const {data: issueCountWithFilter, isPending: isPendingIssueCountWithFilter} = useQuery({
    queryKey: ['issue', 'count', 'filtered', title, labelNames.join(',')],
    queryFn: () => getIssueCountWithFilter(title, labelNames),
    enabled: withFilter,
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
  }
}

export function useCreateIssue() {
  const toast = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIssue,
    onSuccess: newIssue => {
      queryClient.invalidateQueries({queryKey: ['issues']})

      archiveIssue(newIssue, SUBMIT_TYPE.CREATE).catch(err => {
        console.log('🚀 ~ archiveIssue failed:', err)
        toast.warning('Issue Archive Failed')
      })
    },
  })
}

export function useUpdateIssue() {
  const toast = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateIssue,
    onSuccess: newIssue => {
      queryClient.invalidateQueries({queryKey: ['issues']})

      archiveIssue(newIssue, SUBMIT_TYPE.UPDATE).catch(err => {
        console.log('🚀 ~ archiveIssue failed:', err)
        toast.warning('Issue Archive Failed')
      })
    },
  })
}
