import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {SUBMIT_TYPE} from '@/constants'
import type {CreateIssueParams, UpdateIssueParams} from '@/types/issues'
import {archiveIssue, createIssue, getIssueCount, getIssues, updateIssue} from '@/utils/rpc'

interface UseIssuesParams {
  page: number
  LabelNames?: string[]
  title?: string
}

export default function useIssues({page, LabelNames = [], title = ''}: UseIssuesParams) {
  const queryClient = useQueryClient()

  const {data: issues = [], isLoading: issuesLoading} = useQuery({
    queryKey: ['issues', page, LabelNames, title],
    queryFn: () => getIssues(page, LabelNames, title),
  })

  const {data: totalCount = 1} = useQuery({
    queryKey: ['issue', 'count', LabelNames, title],
    queryFn: () => getIssueCount(title, LabelNames),
  })

  const createIssueMutation = useMutation({
    mutationFn: (params: CreateIssueParams) => createIssue(params),
    onSuccess: async data => {
      await archiveIssue(data, SUBMIT_TYPE.CREATE)
      queryClient.invalidateQueries({queryKey: ['issues']})
      message.success('Issue created successfully')
    },
    onError: () => {
      message.error('Failed to create issue')
    },
  })

  const updateIssueMutation = useMutation({
    mutationFn: (params: UpdateIssueParams) => updateIssue(params),
    onSuccess: async (data, variables) => {
      await archiveIssue({...variables, ...data}, SUBMIT_TYPE.UPDATE)
      queryClient.invalidateQueries({queryKey: ['issues']})
      message.success('Issue updated successfully')
    },
    onError: () => {
      message.error('Failed to update issue')
    },
  })

  return {
    issues,
    totalCount,
    issuesLoading,
    createIssue: createIssueMutation.mutateAsync,
    updateIssue: updateIssueMutation.mutateAsync,
  }
}
