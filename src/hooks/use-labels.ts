import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {createLabel, deleteLabel, getLabels, updateLabel} from '@/utils/rpc'

export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  })
}

export function useCreateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (label: Omit<MinimalLabel, 'id'>) => createLabel(label),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
    },
    onError: (error, variables) => {
      if (error.message.includes('already_exists')) {
        message.error(`Label (${variables.name}) has already been taken.`)
        return
      }
      message.error(error.message)
    },
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      newLabel,
      oldLabel,
    }: {
      newLabel: Omit<MinimalLabel, 'id'>
      oldLabel: MinimalLabel
    }) => updateLabel(newLabel, oldLabel),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
    },
    onError: (error, variables) => {
      if (error.message.includes('already_exists')) {
        message.error(`Label (${variables.newLabel.name}) has already been taken.`)
        return
      }
      message.error(error.message)
    },
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({queryKey: ['labels']})
      message.success(`Label (${variables}) deleted successfully`)
    },
    onError: error => {
      message.error(error.message)
    },
  })
}
