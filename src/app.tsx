import 'github-markdown-css'

import {useEffect, useState} from 'react'
import {ActionBar, Editor, Labels, Posts} from '@/components'
import {MESSAGE_TYPE} from '@/constants'
import {useToast} from '@/hooks/use-toast'
import {rpc} from '@/utils/rpc'

import '@/app.css'

export default function App() {
  const [postsVisible, setPostsVisible] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)

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
      <Editor />
      <Posts visible={postsVisible} onSetPostsVisible={onPostsVisibleChange} />
      <Labels visible={labelsVisible} onSetLabelsVisible={onLabelsVisibleChange} />
      <ActionBar
        onSetLabelsVisible={onLabelsVisibleChange}
        onSetPostsVisible={onPostsVisibleChange}
      />
    </div>
  )
}
