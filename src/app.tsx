import 'github-markdown-css'

import {useState} from 'react'
import {ActionBar, Editor, Issues, Labels} from '@/components'

import '@/app.css'

export default function App() {
  const [issuesVisible, setIssuesVisible] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)

  return (
    <div className="app">
      <Editor />
      <Issues visible={issuesVisible} onIssuesVisible={setIssuesVisible} />
      <Labels visible={labelsVisible} onLabelsVisible={setLabelsVisible} />
      <ActionBar onLabelsVisible={setLabelsVisible} onIssuesVisible={setIssuesVisible} />
    </div>
  )
}
