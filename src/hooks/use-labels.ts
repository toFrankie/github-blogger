import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
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
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
    },
  })
}
