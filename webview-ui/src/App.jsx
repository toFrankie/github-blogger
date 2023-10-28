/* eslint-disable import/no-unresolved */
/* eslint-disable no-restricted-globals */
/* eslint-disable react-hooks/exhaustive-deps */

import {useEffect} from 'react'
import {observer, useLocalObservable} from 'mobx-react-lite'
import {Spin, message} from 'antd'
import {WebviewRPC} from 'vscode-webview-rpc'
import 'bytemd/dist/index.min.css'
import 'github-markdown-css'

import './App.css'
import './reset.css'
import Editor from './components/editor'
import ActionBox from './components/action-box'
import LabelManager from './components/label-manager'
import List from './components/list'
import {getMilestones} from './service'
import {getVscode} from './utils'

let RPC

const vscode = getVscode()

const showError = res => {
  message.error(res)
  return Promise.resolve()
}

const showSuccess = res => {
  message.success(res)
  return Promise.resolve()
}

const App = observer(() => {
  const store = useLocalObservable(() => ({
    labels: [],
    milestones: [],
    issues: [],
    filterLabels: [],
    filterMilestones: [],
    current: {},
    totalCount: 1,
    currentPage: 1,
    listVisible: false,
    tagsVisible: false,
    loading: false,
    setLoading: e => {
      store.loading = e
    },
    setFilterLabels: e => {
      store.filterLabels = e
    },
    getLabels: async () => {
      const labels = await RPC.emit('getLabels', [])
      store.labels = labels || []
    },
    createLabel: async e => {
      await RPC.emit('createLabel', [e])
      store.getLabels()
      return Promise.resolve()
    },
    deleteLabel: async e => {
      await RPC.emit('deleteLabel', [e])
      store.getLabels()
    },
    updateLabel: async (a, b) => {
      await RPC.emit('updateLabel', [a, b])
      store.getLabels()
      return Promise.resolve()
    },
    getMilestones: async () => {
      const milestones = await getMilestones()
      store.milestones = milestones
    },
    getIssueTotalCount: async () => {
      let count
      if (store.filterLabels.length > 0) {
        count = await RPC.emit('getFilterCount', [
          store.filterLabels.map(item => item.name).join(','),
        ])
      } else {
        count = await RPC.emit('getTotalCount')
      }
      console.log(count)
      store.totalCount = count
    },
    getIssues: async () => {
      store.getIssueTotalCount()
      const issues = await RPC.emit('getIssues', [
        store.currentPage,
        store.filterLabels.map(item => item.name).join(','),
      ])
      store.issues = issues || []
    },
    setCurrentPage(index) {
      store.currentPage = index
      store.getIssues()
    },
    updateTitle: e => {
      store.current.title = e
    },
    setListVisible: e => {
      store.listVisible = e
      store.getIssues()
    },
    setTagsVisible: e => {
      store.tagsVisible = e
    },
    setCurrentIssue: e => {
      store.current = e
    },
    setCurrentIssueBody: e => {
      store.current.body = e
    },
    addTag: e => {
      if (!store.current.labels) store.current.labels = []
      store.current.labels = store.current.labels.concat(e)
    },
    removeTag: e => {
      if (!store.current.labels) store.current.labels = []
      store.current.labels = store.current.labels.filter(item => item.id !== e.id)
    },
    updateIssue: async () => {
      const {number = undefined, title = '', body = '', labels = []} = store.current
      if (!title || !body) return message.error('Please enter the content...')
      if (!number) {
        const data = await RPC.emit('createIssue', [title, body, labels])
        store.current.number = data.number
      } else {
        await RPC.emit('updateIssue', [number, title, body, JSON.stringify(labels)])
      }
      return Promise.resolve()
    },
  }))

  useEffect(() => {
    RPC = new WebviewRPC(window, vscode)
    RPC.on('showSuccess', showSuccess)
    RPC.on('showError', showError)
    store.getLabels()
    store.getIssues()
  }, [])

  const checkFile = file => {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image`s maxsize is 2MB')
    }
    return isLt2M
  }

  const uploadImages = e => {
    if (e.length === 0) return
    const img = e[0]
    if (!checkFile(img)) return
    const hide = message.loading('Uploading Picture...', 0)
    const ext = img.name.split('.').pop()
    const path = `images/${new Date().getTime()}.${ext}`
    const fileReader = new FileReader()
    fileReader.readAsDataURL(img)
    return new Promise((resolve, reject) => {
      fileReader.onloadend = () => {
        const content = fileReader.result.split(',')[1]
        RPC.emit('uploadImage', [content, path])
          .then(res => {
            hide()
            message.success('Uploaded!')
            resolve(res)
          })
          .catch(err => {
            reject(err)
            message.error('Uploading failed')
          })
      }
    })
  }

  return (
    <Spin spinning={store.loading} tip="Syncing...">
      <div className="app">
        <Editor
          content={store.current.body || ''}
          labels={store.current.labels || []}
          placeholder="Leave your thought..."
          store={store}
          title={store.current.title || ''}
          totalLabels={store.labels || []}
          uploadImages={uploadImages}
        />
        <List
          currentPage={store.currentPage}
          issues={store.issues}
          labels={store.filterLabels}
          store={store}
          totalCount={store.totalCount}
          totalLabels={store.labels}
          visible={store.listVisible}
        />
        <LabelManager labels={store.labels} store={store} visible={store.tagsVisible} />
        <ActionBox store={store} />
      </div>
    </Spin>
  )
})

export default App
