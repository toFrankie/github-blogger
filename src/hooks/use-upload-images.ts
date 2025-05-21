import {useMutation} from '@tanstack/react-query'
import dayjs from 'dayjs'
import {MESSAGE_TYPE} from '@/constants'
import {rpc} from '@/utils/rpc'
import {useToast} from './use-toast'

function checkFileSize(file: File) {
  const isLt2M = file.size / 1024 / 1024 < 2
  return isLt2M
}

type UploadImagesResult = {
  url: string
  title?: string
  alt?: string
}[]

export function useUploadImages() {
  const toast = useToast()

  const uploadMutation = useMutation<UploadImagesResult, Error, File[]>({
    mutationFn: async (files: File[]) => {
      if (files.length === 0) {
        throw new Error('Please select a image')
      }

      const img = files[0]
      const isLt2M = checkFileSize(img)
      if (!isLt2M) {
        throw new Error('Image maxsize is 2MB')
      }

      const dayjsObj = dayjs()
      const ext = img.name.split('.').pop()?.toLowerCase()
      const path = `images/${dayjsObj.year()}/${dayjsObj.month() + 1}/${dayjsObj.valueOf()}.${ext}`

      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(img)

        fileReader.onloadend = () => {
          const content = fileReader.result?.toString().split(',')[1]
          if (!content) {
            reject(new Error('Failed to read file'))
            return
          }
          rpc.emit(MESSAGE_TYPE.UPLOAD_IMAGE, [content, path]).then(resolve).catch(reject)
        }
      })
    },
    onSuccess: () => {
      toast.success('Uploaded Successfully')
    },
    onError: (error: Error) => {
      toast.critical(error.message || 'Upload Failed')
    },
  })

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
  }
}
