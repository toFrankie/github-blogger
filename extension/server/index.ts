import {Octokit} from '@octokit/core'
import {ExtensionRPC} from 'vscode-webview-rpc'
import {encode} from 'js-base64'
import * as vscode from 'vscode'
import {MESSAGE_TYPE} from '../constants'

import {APIS, DEFAULT_LABEL_COLOR, DEFAULT_PAGINATION_SIZE} from '../constants'
import {getSettings, to, cdnURL} from '../utils'
import {normalizeIssueFromGraphql, normalizeIssueFromRest} from '../utils/normalize'
import * as graphqlQueries from './graphql-queries'

export default class Service {
  public config: Settings
  public octokit: Octokit
  public webview: vscode.Webview
  public rpc: ExtensionRPC

  constructor(webview: vscode.Webview) {
    this.webview = webview
    this.config = {} as Settings
    this.octokit = {} as Octokit
    this.rpc = new ExtensionRPC(this.webview)
    this.init()
  }

  private async init() {
    this.config = getSettings()
    this.octokit = new Octokit({auth: this.config.token})
    this.registerRpcListener()
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

  private async getLabels(params: {page: number; per_page: number}) {
    const [_err, res] = await to(
      this.octokit.request(APIS.GET_LABELS, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    return res?.data ?? []
  }

  private async createLabel(params: {name: string}) {
    const [_err, res] = await to(
      this.octokit.request(APIS.CREATE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        color: DEFAULT_LABEL_COLOR,
        ...params,
      })
    )
    return res?.data ?? {}
  }

  private async deleteLabel(params: {name: string}) {
    const [_err, res] = await to(
      this.octokit.request(APIS.DELETE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    return res?.data ?? []
  }

  private async updateLabel(params: {name: string; new_name: string}) {
    const [_err, res] = await to(
      this.octokit.request(APIS.UPDATE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    return res?.data ?? []
  }

  private async getIssues(params: {page: number; labels: string}) {
    const [err, res] = await to(
      this.octokit.request(APIS.GET_ISSUES, {
        owner: this.config.user,
        repo: this.config.repo,
        per_page: DEFAULT_PAGINATION_SIZE,
        ...params,
      })
    )

    if (err) return []
    return res.data.map(issue => normalizeIssueFromRest(issue))
  }

  private async getIssuesWithFilter(params: {
    title: string
    labels: string
    cursor?: string
    first?: number
  }) {
    const [err, res] = await to(
      this.octokit.graphql<GraphqlSearchIssuesResponse>(
        graphqlQueries.getIssuesWithFilter({
          username: this.config.user,
          repository: this.config.repo,
          ...params,
        })
      )
    )

    if (err) return []
    return res.search.edges.map(({node}) => normalizeIssueFromGraphql(node))
  }

  private async updateIssue(params: UpdateIssueParams) {
    const [_err, res] = await to(
      this.octokit.request(APIS.UPDATE_ISSUE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    return res?.data ?? []
  }

  private async createIssue(params: CreateIssueParams) {
    const [_err, res] = await to(
      this.octokit.request(APIS.CREATE_ISSUE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )
    return res?.data ?? undefined
  }

  private async uploadImage(params: {content: string; path: string}) {
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

  private async getIssueCount() {
    const [err, res] = await to(
      this.octokit.graphql<GraphqlIssueCountResponse>(
        graphqlQueries.getIssueCount({username: this.config.user, repository: this.config.repo})
      )
    )
    if (!err) return res.repository.issues.totalCount
    return 0
  }

  private async getIssueCountWithFilter(title: string, labels: string) {
    const [err, res] = await to<GraphqlIssueCountWithFilterResponse>(
      this.octokit.graphql(
        graphqlQueries.getIssueCountWithFilter({
          username: this.config.user,
          repository: this.config.repo,
          title,
          labels,
        })
      )
    )
    if (!err) return res.search.issueCount
    return 0
  }

  private async getRef() {
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

  private async getCommit(params: {commit_sha: string}) {
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

  private async createBlob(params: {content: string}) {
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

  private async createTree(params: CreateTreeParams) {
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

  private async createCommit(params: {message: string; tree: string; parents: string[]}) {
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

  private async updateRef(params: {sha: string}) {
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

  private registerRpcListener() {
    const getLabels = async () => {
      const data = await this.getLabels({page: 0, per_page: 100})
      return data
    }

    const getIssues = async (page: number, labels: string) => {
      return await this.getIssues({page, labels})
    }

    const getIssuesWithFilter = async (page: number, labels: string, title: string) => {
      return await this.getIssuesWithFilter({
        title,
        labels,
        cursor: page > 1 ? encode(`cursor:${(page - 1) * 20}`) : undefined,
        first: DEFAULT_PAGINATION_SIZE,
      })
    }

    const createLabel = async (name: string) => {
      return await this.createLabel({name})
    }

    const deleteLabel = async (name: string) => {
      return await this.deleteLabel({name})
    }

    const updateLabel = async (name: string, newName: string) => {
      return await this.updateLabel({name, new_name: newName})
    }

    const createIssue = async (...args: CreateIssueRpcArgs) => {
      const params: CreateIssueParams = {
        title: args[0],
        body: args[1],
        labels: JSON.parse(args[2]),
      }
      return await this.createIssue(params)
    }

    const updateIssue = async (...args: UpdateIssueRpcArgs) => {
      const params: UpdateIssueParams = {
        issue_number: args[0],
        title: args[1],
        body: args[2],
        labels: JSON.parse(args[3]),
      }
      return await this.updateIssue(params)
    }

    const uploadImage = async (content, path) => {
      return await this.uploadImage({content, path})
    }

    const getIssueCount = async () => {
      return await this.getIssueCount()
    }

    const getIssueCountWithFilter = async (title: string, labels: string) => {
      return await this.getIssueCountWithFilter(title, labels)
    }

    const getRef = async () => {
      return await this.getRef()
    }

    const updateRef = async (sha: string) => {
      return await this.updateRef({sha})
    }

    const getCommit = async (sha: string) => {
      return await this.getCommit({commit_sha: sha})
    }

    const createCommit = async (parentCommitSha: string, treeSha: string, message: string) => {
      return await this.createCommit({
        message,
        tree: treeSha,
        parents: [parentCommitSha],
      })
    }

    const createBlob = async (content: string) => {
      return await this.createBlob({content})
    }

    const createTree = async (baseTree: string, path: string, sha: string) => {
      return await this.createTree({
        base_tree: baseTree,
        tree: [{path, mode: '100644', type: 'blob', sha}],
      })
    }

    const labelHandlers = {
      [MESSAGE_TYPE.GET_LABELS]: getLabels,
      [MESSAGE_TYPE.DELETE_LABEL]: deleteLabel,
      [MESSAGE_TYPE.CREATE_LABEL]: createLabel,
      [MESSAGE_TYPE.UPDATE_LABEL]: updateLabel,
    }

    const issueHandlers = {
      [MESSAGE_TYPE.GET_ISSUES]: getIssues,
      [MESSAGE_TYPE.GET_ISSUES_WITH_FILTER]: getIssuesWithFilter,
      [MESSAGE_TYPE.UPDATE_ISSUE]: updateIssue,
      [MESSAGE_TYPE.CREATE_ISSUE]: createIssue,
      [MESSAGE_TYPE.GET_ISSUE_COUNT]: getIssueCount,
      [MESSAGE_TYPE.GET_ISSUE_COUNT_WITH_FILTER]: getIssueCountWithFilter,
    }

    const gitHandlers = {
      [MESSAGE_TYPE.UPDATE_REF]: updateRef,
      [MESSAGE_TYPE.GET_COMMIT]: getCommit,
      [MESSAGE_TYPE.CREATE_COMMIT]: createCommit,
      [MESSAGE_TYPE.CREATE_BLOB]: createBlob,
      [MESSAGE_TYPE.CREATE_TREE]: createTree,
    }

    const otherHandlers = {
      [MESSAGE_TYPE.UPLOAD_IMAGE]: uploadImage,
    }

    Object.entries({
      ...labelHandlers,
      ...issueHandlers,
      ...gitHandlers,
      ...otherHandlers,
    }).forEach(([type, handler]) => {
      this.rpc.on(type, handler)
    })
  }
}
