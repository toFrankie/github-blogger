import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {SUBMIT_TYPE} from '@/constants'
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

  return {
    issues,
    totalCount,
    issuesLoading,
    createIssue: createIssueMutation.mutateAsync,
    updateIssue: updateIssueMutation.mutateAsync,
  }
}
