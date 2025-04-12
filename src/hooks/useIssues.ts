import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {SUBMIT_TYPE} from '@/constants'
import {archiveIssue, createIssue, getIssues, getIssueTotalCount, updateIssue} from '@/service/api'

export default function useIssues(
  page: number,
  filterLabels: any[] = [],
  filterTitle: string = ''
) {
  const queryClient = useQueryClient()

  const {data: issues = [], isLoading: issuesLoading} = useQuery({
    queryKey: ['issues', page, filterLabels, filterTitle],
    queryFn: () => getIssues(page, filterLabels, filterTitle),
  })

  const {data: totalCount = 1} = useQuery({
    queryKey: ['totalCount', filterLabels],
    queryFn: () => getIssueTotalCount(filterLabels),
  })

  const createIssueMutation = useMutation({
    mutationFn: ({title, body, labels}: {title: string; body: string; labels: any[]}) =>
      createIssue(title, body, labels),
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
    mutationFn: ({
      number,
      title,
      body,
      labels,
    }: {
      number: number
      title: string
      body: string
      labels: any[]
    }) => updateIssue(number, title, body, labels),
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
    createIssue: createIssueMutation.mutate,
    updateIssue: updateIssueMutation.mutate,
  }
}
