/* eslint-disable no-return-await */

import {Octokit} from '@octokit/core'
import {ExtensionRPC} from 'vscode-webview-rpc'
import {encode} from 'js-base64'

import {APIS, DEFAULT_LABEL_COLOR, DEFAULT_PAGINATION_SIZE} from '../constants'
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
      repository(
        owner: "${username}"
        name: "${repository}"
      ) {
        issues(states: OPEN) {
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
      search(
        type: ISSUE
        query: "user:${username} repo:${repository} state:open ${
          milestone ? `milestone:${milestone}` : ''
        } ${label ? `label:${label}` : ''}"
      ) {
        issueCount
      }
    }
  `,

  /**
   * 过滤器来获取 issue
   * @param {object} params
   * @param {string} params.username 用户名
   * @param {string} params.repository 仓库名
   * @param {string} [params.label] 标签
   * @param {string} [params.milestone] 里程碑
   */
  getFilterIssue: ({username, repository, first, labels, title, cursor}) => `
    {
      search(
        type: ISSUE
        first: ${first}
        ${cursor ? `after: "${cursor}"` : ''}
        query: "user:${username} repo:${repository} state:open ${labels ? `label:${labels}` : ''} ${
          title ? `in:title ${title}` : ''
        }"
      ) {
        issueCount
        edges {
          node {
            ... on Issue {
              url
              id
              title
              url
              body
              createdAt
              updatedAt
              number
              state
              milestone {
                id
                title
              }
              labels(first: 100) {
                nodes {
                  id
                  url
                  name
                  color
                  description
                }
              }
            }
          }
        }
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
      if (options.url.includes('/git')) return

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
        color: DEFAULT_LABEL_COLOR,
        ...params,
      })
    )
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
        per_page: DEFAULT_PAGINATION_SIZE,
        ...params,
      })
    )
    if (!err) {
      return res?.data
    }
    return []
  }

  async getFilterIssues(params) {
    const [err, res] = await to(
      this.octokit.graphql(
        documents.getFilterIssue({
          username: this.config.user,
          repository: this.config.repo,
          ...params,
        })
      )
    )
    if (!err)
      return {
        issueCount: res.search.issueCount,
        issues: res.search.edges.map(({node}) => ({
          ...node,
          labels: node.labels.nodes,
        })),
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
        message: 'chore: upload image',
        ...params,
      })
    )
    if (!err) {
      return [
        {
          url: cdnURL({
            user: this.config.user,
            repo: this.config.repo,
            filePath: params.path,
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
    if (!err) return res.search.issueCount
    return 1
  }

  async queryTotalCount() {
    const [err, res] = await to(
      this.octokit.graphql(
        documents.getIssueCount({username: this.config.user, repository: this.config.repo})
      )
    )
    if (!err) return res.repository.issues.totalCount
    return 1
  }

  async getRef() {
    const [err, res] = await to(
      this.octokit.request(APIS.GET_REF, {
        owner: this.config.user,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
      })
    )
    if (!err) return res.data.object.sha
    return ''
  }

  async getCommit(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.GET_COMMIT, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.tree.sha
    return ''
  }

  async createBlob(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_BLOB, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.sha
    return ''
  }

  async createTree(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_TREE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.sha
    return ''
  }

  async createCommit(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_COMMIT, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.sha
    return ''
  }

  async updateRef(params) {
    const [err, res] = await to(
      this.octokit.request(APIS.UPDATE_REF, {
        owner: this.config.user,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
        ...params,
      })
    )
    if (!err) return res.data
    return ''
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

    const getFilterIssues = async (title, labels, page) => {
      return await this.getFilterIssues({
        title,
        labels,
        cursor: page > 1 ? encode(`cursor:${(page - 1) * 20}`) : undefined,
        first: DEFAULT_PAGINATION_SIZE,
      })
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
      return await this.createIssue({
        title,
        body,
        labels: JSON.parse(labels),
      })
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

    const getRef = async () => {
      return await this.getRef()
    }

    const updateRef = async sha => {
      return await this.updateRef({sha})
    }

    const getCommit = async sha => {
      return await this.getCommit({commit_sha: sha})
    }

    const createCommit = async (parentCommitSha, treeSha, message) => {
      return await this.createCommit({
        message,
        tree: treeSha,
        parents: [parentCommitSha],
      })
    }

    const createBlob = async content => {
      return await this.createBlob({content})
    }

    const createTree = async (baseTree, path, sha) => {
      return await this.createTree({
        base_tree: baseTree,
        tree: [{path, mode: '100644', type: 'blob', sha}],
      })
    }

    this.rpc.on('getLabels', getLabels)
    this.rpc.on('deleteLabel', deleteLabel)
    this.rpc.on('createLabel', createLabel)
    this.rpc.on('updateLabel', updateLabel)
    this.rpc.on('getIssues', getIssues)
    this.rpc.on('getFilterIssues', getFilterIssues)
    this.rpc.on('updateIssue', updateIssue)
    this.rpc.on('createIssue', createIssue)
    this.rpc.on('uploadImage', uploadImage)
    this.rpc.on('getFilterCount', getFilterCount)
    this.rpc.on('getTotalCount', getTotalCount)
    this.rpc.on('getRef', getRef)
    this.rpc.on('updateRef', updateRef)
    this.rpc.on('getCommit', getCommit)
    this.rpc.on('createCommit', createCommit)
    this.rpc.on('createBlob', createBlob)
    this.rpc.on('createTree', createTree)
  }
}
