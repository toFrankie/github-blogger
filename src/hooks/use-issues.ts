import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo} from 'react'
import {SUBMIT_TYPE} from '@/constants'
import {
  archiveIssue,
  createIssue,
  getIssueCount,
  getIssueCountWithFilter,
  getIssues,
  updateIssue,
} from '@/utils/rpc'
import {useToast} from './use-toast'

interface UseIssuesParams {
  page?: number
  labelNames?: string[]
  title?: string
}

export function useIssues({page = 1, labelNames = [], title = ''}: UseIssuesParams) {
  return useQuery({
    queryKey: ['issues', 'list', page, title, labelNames.join(',')],
    queryFn: () => getIssues(page, labelNames, title),
    gcTime: Infinity,
    staleTime: Infinity,
  })
}

export function useIssueCount() {
  return useQuery({
    queryKey: ['issues', 'count', 'total'],
    queryFn: () => getIssueCount(),
    gcTime: Infinity,
    staleTime: Infinity,
  })
}

export function useIssueCountWithFilter({
  labelNames = [],
  title = '',
}: Omit<UseIssuesParams, 'page'>) {
  const withFilter = useMemo(() => {
    return !!title || labelNames.length > 0
  }, [title, labelNames])

  return useQuery({
    queryKey: ['issues', 'count', 'filtered', title, labelNames.join(',')],
    queryFn: () => getIssueCountWithFilter(title, labelNames),
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: withFilter,
  })
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
