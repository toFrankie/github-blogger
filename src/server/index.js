/* eslint-disable no-return-await */

import {Octokit} from '@octokit/core'
import {ExtensionRPC} from 'vscode-webview-rpc'

import {APIS} from '../constants'
import {getSetting, to, cdnURL} from '../utils'

/**
 * 构建 GraphQL
 */
const documents = {
  /**
   * 获取 issues 总数
   * @param {object} params
   * @param {string} params.username 用户名
   * @param {string} params.repository 仓库名
   */
  getIssueCount: ({username, repository}) => `
    query {
      repository(owner:"${username}", name: "${repository}") {
        issues(states:OPEN) {
          totalCount
        }
      }
    }
  `,

  /**
   * 过滤器来获取 issue 数量
   * @param {object} params
   * @param {string} params.username 用户名
   * @param {string} params.repository 仓库名
   * @param {string} [params.label] 标签
   * @param {string} [params.milestone] 里程碑
   */
  getFilterIssueCount: ({username, repository, label, milestone}) => `
    {
      search(type:ISSUE, query: "
        user:${username}
        repo:${repository}
        state:open
        ${milestone ? `milestone:${milestone}` : ''}
        ${label ? `label:${label}` : ''}
      ") {
        issueCount
      }
    }
  `,
}

export default class Service {
  config
  octokit
  webview
  rpc

  constructor(webview) {
    this.config = {}
    this.webview = webview
    this.octokit = null
    this.rpc = new ExtensionRPC(this.webview)
    this.init()
  }

  /**
   * 初始化octokit
   */
  async init() {
    this.config = await getSetting()
    this.octokit = new Octokit({
      auth: this.config.token,
    })
    this._registerMethod()
    this.octokit.hook.after('request', async (_response, options) => {
      if (options.url.includes('/graphql')) return
      if (options.method === 'DELETE')
        return await this.rpc.emit('showSuccess', ['Removed Successfully'])
      if (options.method === 'POST')
        return await this.rpc.emit('showSuccess', ['Created Successfully'])
      if (options.method === 'PATCH')
        return await this.rpc.emit('showSuccess', ['Updated Successfully'])
    })
    this.octokit.hook.error('request', async (error, _options) => {
      this.rpc.emit('showError', [JSON.stringify(error)])
    })
  }

  async getLabels(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.GET_LABELS, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) {
      return res?.data || []
    }
    return []
  }

  async createLabel(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    console.log(err)
    if (!err) {
      return res?.data || {}
    }
    return []
  }

  async deleteLabel(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.DELETE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) {
      return res?.data
    }
    return []
  }

  async updateLabel(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.UPDATE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) {
      return res?.data
    }
    return []
  }

  async getIssues(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.GET_ISSUES, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
        per_page: 20,
      })
    )
    if (!err) {
      return res?.data
    }
    return []
  }

  async updateIssue(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.UPDATE_ISSUE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) {
      return res?.data
    }
    return []
  }

  async createIssue(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_ISSUE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) {
      return res?.data
    }
    return []
  }

  async uploadImage(params) {
    const [err] = await to(
      this.octokit.request(APIS.UPLOAD_IMAGE, {
        owner: this.config.user,
        repo: this.config.repo,
        message: 'upload images',
        ...params,
      })
    )
    if (!err) {
      return [
        {
          url: cdnURL({
            user: this.config.user,
            repo: this.config.repo,
            file: params.path,
          }),
        },
      ]
    }
    return []
  }

  async queryFilterIssueCount(label) {
    const [err, res] = await to(
      this.octokit.graphql(
        documents.getFilterIssueCount({
          username: this.config.user,
          repository: this.config.repo,
          label,
          milestone: undefined,
        })
      )
    )
    if (!err) {
      const {
        search: {issueCount},
      } = res
      return issueCount
    }
    return 1
  }

  async queryTotalCount() {
    const [err, res] = await to(
      this.octokit.graphql(
        documents.getIssueCount({username: this.config.user, repository: this.config.repo})
      )
    )
    console.log('total', res)
    if (!err) {
      const {
        repository: {
          issues: {totalCount},
        },
      } = res
      return totalCount
    }
    return 1
  }

  /**
   * 注册事件
   */
  async _registerMethod() {
    const getLabels = async () => {
      const data = await this.getLabels({page: 0, per_page: 100})
      return data
    }
    const getIssues = async (page, labels) => {
      return await this.getIssues({page, labels})
    }
    const createLabel = async name => {
      return await this.createLabel({name})
    }
    const deleteLabel = async name => {
      return await this.deleteLabel({name})
    }
    const updateLabel = async (name, newName) => {
      return await this.updateLabel({name, new_name: newName})
    }

    const createIssue = async (title, body, labels) => {
      return await this.createIssue({title, body, labels})
    }

    const updateIssue = async (issueNumber, title, body, labels) => {
      return await this.updateIssue({
        issue_number: issueNumber,
        title,
        body,
        labels: JSON.parse(labels),
      })
    }

    const uploadImage = async (content, path) => {
      return await this.uploadImage({content, path})
    }

    const getTotalCount = async () => {
      return await this.queryTotalCount()
    }

    const getFilterCount = async label => {
      return await this.queryFilterIssueCount(label)
    }

    this.rpc.on('getLabels', getLabels)
    this.rpc.on('deleteLabel', deleteLabel)
    this.rpc.on('createLabel', createLabel)
    this.rpc.on('updateLabel', updateLabel)
    this.rpc.on('getIssues', getIssues)
    this.rpc.on('updateIssue', updateIssue)
    this.rpc.on('createIssue', createIssue)
    this.rpc.on('uploadImage', uploadImage)
    this.rpc.on('getFilterCount', getFilterCount)
    this.rpc.on('getTotalCount', getTotalCount)
  }
}
