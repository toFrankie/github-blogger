import {useMutation} from '@tanstack/react-query'
import {uploadImage} from '@/utils/rpc'
import {useToast} from './use-toast'

export function useUploadImages() {
  const toast = useToast()

  return useMutation<ClientUploadImagesResult, Error, File[]>({
    mutationFn: uploadImage,
    onError: error => {
      toast.critical(error.message)
    },
  })
}
