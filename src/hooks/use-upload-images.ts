import {useMutation} from '@tanstack/react-query'
import {message} from 'antd'
import dayjs from 'dayjs'
import {MESSAGE_TYPE} from '@/constants'
import {rpc} from '@/utils/rpc'

function checkFile(file: File) {
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image maxsize is 2MB')
  }
  return isLt2M
}

type UploadImagesResult = {
  url: string
  title?: string
  alt?: string
}[]

export function useUploadImages() {
  const uploadMutation = useMutation<UploadImagesResult, Error, File[]>({
    mutationFn: async (files: File[]) => {
      if (files.length === 0) {
        throw new Error('Please select a image')
      }

      const img = files[0]
      if (!checkFile(img)) {
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
      message.success('Uploaded Successfully')
    },
    onError: (error: Error) => {
      message.error(error.message || 'Upload Failed')
    },
  })

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
  }
}
