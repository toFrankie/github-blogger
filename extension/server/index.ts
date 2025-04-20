import {Octokit} from '@octokit/core'
import {ExtensionRPC} from 'vscode-webview-rpc'
import {encode} from 'js-base64'
import * as vscode from 'vscode'
import {MESSAGE_TYPE} from '../constants'

import {APIS, DEFAULT_LABEL_COLOR, DEFAULT_PAGINATION_SIZE} from '../constants'
import {getSettings, to, cdnURL} from '../utils'
import * as graphqlQueries from './graphql-queries'

export default class Service {
  config: Settings
  octokit: Octokit
  webview: vscode.Webview
  rpc: ExtensionRPC

  constructor(webview: vscode.Webview) {
    this.config = null!
    this.webview = webview
    this.octokit = null!
    this.rpc = new ExtensionRPC(this.webview)
    this.init()
  }

  async init() {
    this.config = await getSettings()
    this.octokit = new Octokit({
      auth: this.config.token,
    })
    this._registerMethod()
    this.octokit.hook.after('request', async (_response, options) => {
      if (options.url.includes('/graphql')) return
      if (options.url.includes('/git')) return

      if (options.method === 'DELETE') {
        return await this.rpc.emit(MESSAGE_TYPE.SHOW_SUCCESS, ['Removed Successfully'])
      }
      if (options.method === 'POST') {
        return await this.rpc.emit(MESSAGE_TYPE.SHOW_SUCCESS, ['Created Successfully'])
      }
      if (options.method === 'PATCH') {
        return await this.rpc.emit(MESSAGE_TYPE.SHOW_SUCCESS, ['Updated Successfully'])
      }
    })
    this.octokit.hook.error('request', async (error, _options) => {
      this.rpc.emit(MESSAGE_TYPE.SHOW_ERROR, [JSON.stringify(error)])
    })
  }

  async getLabels(params: {page: number; per_page: number}) {
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

  async createLabel(params: {name: string}) {
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
    return {}
  }

  async deleteLabel(params: {name: string}) {
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

  async updateLabel(params: {name: string; new_name: string}) {
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

  async getIssues(params: {per_page: number}) {
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

  async getIssuesWithFilter(params: {
    title: string
    labels: string
    cursor?: string
    first?: number
  }) {
    const [err, res] = await to<SearchResponse>(
      this.octokit.graphql(
        graphqlQueries.getIssuesWithFilter({
          username: this.config.user,
          repository: this.config.repo,
          ...params,
        })
      )
    )
    if (!err) {
      return {
        issueCount: res.search.issueCount,
        issues: res.search.edges.map(({node}) => ({
          ...node,
          labels: node.labels.nodes,
        })),
      }
    }
    return []
  }

  async updateIssue(params: {issue_number: number; title: string; body: string; labels: string}) {
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

  async createIssue(params: {title: string; body: string; labels: string}) {
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

  async uploadImage(params: {content: string; path: string}) {
    const [err] = await to(
      this.octokit.request(APIS.UPLOAD_IMAGE, {
        owner: this.config.user,
        repo: this.config.repo,
        branch: this.config.branch,
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
            branch: this.config.branch,
            filePath: params.path,
          }),
        },
      ]
    }
    return []
  }

  async queryFilterIssueCount(label: string) {
    const [err, res] = await to<IssueCountResponseWithFilter>(
      this.octokit.graphql(
        graphqlQueries.getIssueCountWithFilter({
          username: this.config.user,
          repository: this.config.repo,
          label,
        })
      )
    )
    if (!err) return res.search.issueCount
    return 1
  }

  async queryTotalCount() {
    const [err, res] = await to<IssueCountResponse>(
      this.octokit.graphql(
        graphqlQueries.getIssueCount({username: this.config.user, repository: this.config.repo})
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
    if (res === undefined) {
      throw new Error(`Please check if the ${this.config.branch} branch exists`)
    }
    if (!err) return res.data.object.sha
    throw err
  }

  async getCommit(params: {commit_sha: string}) {
    const [err, res] = await to(
      this.octokit.request(APIS.GET_COMMIT, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.tree.sha
    throw err
  }

  async createBlob(params: {content: string}) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_BLOB, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.sha
    throw err
  }

  async createTree(params: {
    base_tree: string
    tree: {path: string; mode: string; type: string; sha: string}[]
  }) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_TREE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.sha
    throw err
  }

  async createCommit(params: {message: string; tree: string; parents: string[]}) {
    const [err, res] = await to(
      this.octokit.request(APIS.CREATE_COMMIT, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    if (!err) return res.data.sha
    throw err
  }

  async updateRef(params: {sha: string}) {
    const [err, res] = await to(
      this.octokit.request(APIS.UPDATE_REF, {
        owner: this.config.user,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
        ...params,
      })
    )
    if (!err) return res.data
    throw err
  }

  /**
   * 注册事件
   */
  async _registerMethod() {
    const getLabels = async () => {
      const data = await this.getLabels({page: 0, per_page: 100})
      return data
    }

    const getIssues = async (page: number, labels: string) => {
      return await this.getIssues({page, labels})
    }

    const getIssuesWithFilter = async (title: string, labels: string, page: number) => {
      return await this.getIssuesWithFilter({
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

    this.rpc.on(MESSAGE_TYPE.GET_LABELS, getLabels)
    this.rpc.on(MESSAGE_TYPE.DELETE_LABEL, deleteLabel)
    this.rpc.on(MESSAGE_TYPE.CREATE_LABEL, createLabel)
    this.rpc.on(MESSAGE_TYPE.UPDATE_LABEL, updateLabel)
    this.rpc.on(MESSAGE_TYPE.GET_ISSUES, getIssues)
    this.rpc.on(MESSAGE_TYPE.GET_ISSUES_WITH_FILTER, getIssuesWithFilter)
    this.rpc.on(MESSAGE_TYPE.UPDATE_ISSUE, updateIssue)
    this.rpc.on(MESSAGE_TYPE.CREATE_ISSUE, createIssue)
    this.rpc.on(MESSAGE_TYPE.UPLOAD_IMAGE, uploadImage)
    this.rpc.on(MESSAGE_TYPE.GET_ISSUE_COUNT, getTotalCount)
    this.rpc.on(MESSAGE_TYPE.GET_ISSUE_COUNT_WITH_FILTER, getFilterCount)
    this.rpc.on(MESSAGE_TYPE.UPDATE_REF, updateRef)
    this.rpc.on(MESSAGE_TYPE.GET_COMMIT, getCommit)
    this.rpc.on(MESSAGE_TYPE.CREATE_COMMIT, createCommit)
    this.rpc.on(MESSAGE_TYPE.CREATE_BLOB, createBlob)
    this.rpc.on(MESSAGE_TYPE.CREATE_TREE, createTree)
  }
}
