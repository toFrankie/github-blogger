import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {message} from 'antd'
import {createLabel, deleteLabel, getLabels, updateLabel} from '@/utils/rpc'

export default function useLabels() {
  const queryClient = useQueryClient()

  const {data: labels = [], isPending: isPendingLabels} = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  })

  const {
    mutateAsync: createLabelAsync,
    isPending: isCreatingLabel,
    isError: isErrorCreatingLabel,
    isSuccess: isSuccessCreatingLabel,
  } = useMutation({
    mutationFn: (label: Omit<MinimalLabel, 'id'>) => createLabel(label),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
      message.success('Label created successfully')
    },
    onError: () => {
      message.error('Failed to create label')
    },
  })

  const {
    mutateAsync: deleteLabelAsync,
    isPending: isDeletingLabel,
    isError: isErrorDeletingLabel,
    isSuccess: isSuccessDeletingLabel,
  } = useMutation({
    mutationFn: (label: string) => deleteLabel(label),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['labels']})
      message.success('Label deleted successfully')
    },
    onError: () => {
      message.error('Failed to delete label')
    },
  })

  const {
    mutateAsync: updateLabelAsync,
    isPending: isUpdatingLabel,
    isError: isErrorUpdatingLabel,
    isSuccess: isSuccessUpdatingLabel,
  } = useMutation({
    mutationFn: ({
      newLabel,
      oldLabel,
    }: {
      newLabel: Omit<MinimalLabel, 'id'>
      oldLabel: MinimalLabel
    }) => updateLabel(newLabel, oldLabel),
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
    createLabelAsync,
    deleteLabelAsync,
    updateLabelAsync,
    isPendingLabels,
    isCreatingLabel,
    isDeletingLabel,
    isUpdatingLabel,
    isErrorCreatingLabel,
    isErrorDeletingLabel,
    isErrorUpdatingLabel,
    isSuccessCreatingLabel,
    isSuccessDeletingLabel,
    isSuccessUpdatingLabel,
  }
}
