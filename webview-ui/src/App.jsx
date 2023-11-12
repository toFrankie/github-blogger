/* eslint-disable import/no-unresolved */
/* eslint-disable no-restricted-globals */
/* eslint-disable react-hooks/exhaustive-deps */

import {useEffect} from 'react'
import {observer, useLocalObservable} from 'mobx-react-lite'
import {ConfigProvider, message} from 'antd'
import {WebviewRPC} from 'vscode-webview-rpc'
import dayjs from 'dayjs'
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

const theme = {
  token: {
    colorPrimary: '#00b96b',
    colorInfo: '#00b96b',
    borderRadius: 6,
  },
}

const App = observer(() => {
  const store = useLocalObservable(() => ({
    labels: [],
    milestones: [],
    issues: [],
    filterTitle: '',
    filterLabels: [],
    filterMilestones: [],
    current: {},
    totalCount: 1,
    currentPage: 1,
    listVisible: false,
    labelsVisible: false,
    loading: false,
    setLoading: loading => {
      store.loading = loading
    },
    setFilterTitle: title => {
      store.filterTitle = title
    },
    setFilterLabels: labels => {
      store.filterLabels = labels
    },
    getLabels: async () => {
      const labels = await RPC.emit('getLabels', [])
      store.labels = labels || []
    },
    createLabel: async e => {
      await RPC.emit('createLabel', [e])
      store.getLabels()
    },
    deleteLabel: async e => {
      await RPC.emit('deleteLabel', [e])
      store.getLabels()
    },
    updateLabel: async (a, b) => {
      await RPC.emit('updateLabel', [a, b])
      store.getLabels()
    },
    getMilestones: async () => {
      const milestones = await getMilestones()
      store.milestones = milestones
    },
    getIssueTotalCount: async () => {
      let count
      if (store.filterLabels.length > 0) {
        count = await RPC.emit('getFilterCount', [
          store.filterLabels.map(label => label.name).join(','),
        ])
      } else {
        count = await RPC.emit('getTotalCount')
      }
      store.totalCount = count
    },
    getIssues: async () => {
      store.setLoading(true)
      if (store.filterLabels.length < 2 && !store.filterTitle) {
        store.getIssueTotalCount()
        const issues = await RPC.emit('getIssues', [
          store.currentPage,
          store.filterLabels.map(label => label.name).join(','),
        ])
        store.issues = issues || []
      } else {
        const {issueCount, issues} = await RPC.emit('getFilterIssues', [
          store.filterTitle,
          store.filterLabels.map(label => label.name).join(','),
          store.currentPage,
        ])

        store.totalCount = issueCount
        store.issues = issues
      }
      store.setLoading(false)
    },
    resetCurrentPage: () => {
      store.currentPage = 1
    },
    setCurrentPage(page) {
      store.currentPage = page
      store.getIssues()
    },
    updateTitle: title => {
      store.current.title = title
    },
    setListVisible: visible => {
      store.listVisible = visible
      store.getIssues()
    },
    setLabelVisible: visible => {
      store.labelsVisible = visible
    },
    setCurrentIssue: issue => {
      store.current = issue
    },
    setCurrentIssueBody: body => {
      store.current.body = body
    },
    addLabel: label => {
      if (!store.current.labels) store.current.labels = []
      store.current.labels = store.current.labels.concat(label)
    },
    removeLabel: label => {
      if (!store.current.labels) store.current.labels = []
      store.current.labels = store.current.labels.filter(item => item.id !== label.id)
    },
    updateIssue: async () => {
      const {number = undefined, title = '', body = '', labels = []} = store.current
      if (!title || !body) return message.error('Please enter the content...')
      if (!number) {
        const data = await RPC.emit('createIssue', [title, body, JSON.stringify(labels)])
        store.current.number = data.number
        store.current.html_url = data.html_url
      } else {
        await RPC.emit('updateIssue', [number, title, body, JSON.stringify(labels)])
      }
    },
    backupMarkdown: async () => {
      // 获取 Ref
      const commitSha = await RPC.emit('getRef')

      // 获取当前 Commit 的 Tree SHA
      const treeSha = await RPC.emit('getCommit', [commitSha])

      // 生成 Blob
      const dayjsObj = dayjs()
      const fileContent = dayjsObj.format('YYYY-MM-DD HH:mm:ss') // TODO: content 要修改
      const blobSha = await RPC.emit('createBlob', [fileContent])

      // 生成 Tree
      const filePath = `tmp/${dayjsObj.unix()}.md` // TODO: path 要修改
      const newTreeSha = await RPC.emit('createTree', [treeSha, filePath, blobSha])

      // 生成 Commit
      const commitMessage = `chore: test ${dayjsObj.unix()}` // TODO: message 要修改
      const newCommitSha = await RPC.emit('createCommit', [commitSha, newTreeSha, commitMessage])

      //  更新 Ref
      const newRef = await RPC.emit('updateRef', [newCommitSha])
      console.log(newRef)
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
    <ConfigProvider theme={theme}>
      <div className="app">
        <Editor
          content={store.current.body || ''}
          labels={store.current.labels || []}
          number={store.current.number}
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
        <LabelManager labels={store.labels} store={store} visible={store.labelsVisible} />
        <ActionBox number={store.current.number} store={store} />
      </div>
    </ConfigProvider>
  )
})

export default App
