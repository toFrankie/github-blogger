import 'github-markdown-css'

import {useEffect, useState} from 'react'
import {ActionBar, Editor, Labels, Posts} from '@/components'
import {MESSAGE_TYPE} from '@/constants'
import {useLabels, useUploadImages} from '@/hooks'
import {useToast} from '@/hooks/use-toast'
import {rpc} from '@/utils/rpc'

import '@/app.css'

export default function App() {
  const [postsVisible, setPostsVisible] = useState(true)
  const [labelsVisible, setLabelsVisible] = useState(false)

  const {data: allLabel, isLoading: isLoadingLabels} = useLabels()
  const {upload: handleUploadImages} = useUploadImages()

  const toast = useToast()

  useEffect(() => {
    const showSuccess = (res: string) => toast.success(res)
    const showError = (res: string) => toast.critical(res)

    rpc.on(MESSAGE_TYPE.SHOW_SUCCESS, showSuccess)
    rpc.on(MESSAGE_TYPE.SHOW_ERROR, showError)
  }, [])

  const onPostsVisibleChange = (visible: boolean) => {
    setPostsVisible(visible)
  }

  const onLabelsVisibleChange = (visible: boolean) => {
    setLabelsVisible(visible)
  }

  return (
    <div className="app">
      <Editor
        allLabel={allLabel}
        isLoadingLabels={isLoadingLabels}
        onUploadImages={handleUploadImages}
      />
      <Posts allLabel={allLabel} visible={postsVisible} onSetPostsVisible={onPostsVisibleChange} />
      <Labels
        allLabel={allLabel}
        visible={labelsVisible}
        onSetLabelsVisible={onLabelsVisibleChange}
      />
      <ActionBar
        onSetLabelsVisible={onLabelsVisibleChange}
        onSetPostsVisible={onPostsVisibleChange}
      />
    </div>
  )
}
