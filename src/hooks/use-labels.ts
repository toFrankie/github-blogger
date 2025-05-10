import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {createLabel, deleteLabel, getLabels, updateLabel} from '@/utils/rpc'

export default function useLabels() {
  const queryClient = useQueryClient()

  const {data: labels = [], isLoading: labelLoading} = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  })

  const createLabelMutation = useMutation({
    mutationFn: (label: string) => createLabel(label),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
      message.success('Label created successfully')
    },
    onError: () => {
      message.error('Failed to create label')
    },
  })

  const deleteLabelMutation = useMutation({
    mutationFn: (label: string) => deleteLabel(label),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
      message.success('Label deleted successfully')
    },
    onError: () => {
      message.error('Failed to delete label')
    },
  })

  const updateLabelMutation = useMutation({
    mutationFn: ({oldLabel, newLabel}: {oldLabel: string; newLabel: string}) =>
      updateLabel(oldLabel, newLabel),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
      message.success('Label updated successfully')
    },
    onError: () => {
      message.error('Failed to update label')
    },
  })

  return {
    labels,
    labelLoading,
    createLabel: createLabelMutation.mutateAsync,
    deleteLabel: deleteLabelMutation.mutateAsync,
    updateLabel: updateLabelMutation.mutateAsync,
  }
}
