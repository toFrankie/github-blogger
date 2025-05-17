import {Octokit} from '@octokit/core'
import {ExtensionRPC} from 'vscode-webview-rpc'
import {isEmpty} from 'licia'
import * as vscode from 'vscode'

import {GRAPHQL_PAGINATION_SIZE_LIMIT, MESSAGE_TYPE} from '../constants'
import {APIS, DEFAULT_PAGINATION_SIZE} from '../constants'
import {getSettings, to, cdnURL} from '../utils'
import {createResponse} from '../utils/response'
import {
  normalizeIssueFromGraphql,
  normalizeIssueFromRest,
  normalizeLabelFromRest,
} from '../utils/normalize'
import * as query from './graphql'

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
  }

  private async getLabels() {
    const res = await to(
      this.octokit.request(APIS.GET_LABELS, {
        owner: this.config.user,
        repo: this.config.repo,
        page: 0,
        per_page: 100,
      })
    )

    return createResponse(res, octokitRes =>
      octokitRes.data.map(label => normalizeLabelFromRest(label))
    )
  }

  private async createLabel(...args: CreateLabelRpcArgs) {
    const res = await to(
      this.octokit.request(APIS.CREATE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        name: args[0],
        color: args[1],
        description: args[2] ?? '',
      })
    )

    return createResponse(res, octokitRes => normalizeLabelFromRest(octokitRes.data))
  }

  private async deleteLabel(...args: DeleteLabelRpcArgs) {
    const res = await to(
      this.octokit.request(APIS.DELETE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        name: args[0],
      })
    )

    return createResponse(res)
  }

  private async updateLabel(...args: UpdateLabelRpcArgs) {
    const params: UpdateLabelParams = {
      new_name: args[0],
      name: args[1],
      color: args[2],
      description: args[3],
    }
    const res = await to(
      this.octokit.request(APIS.UPDATE_LABEL, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => normalizeLabelFromRest(octokitRes.data))
  }

  private async getIssues(...args: GetIssuesRpcArgs) {
    const res = await to(
      this.octokit.request(APIS.GET_ISSUES, {
        owner: this.config.user,
        repo: this.config.repo,
        per_page: DEFAULT_PAGINATION_SIZE,
        page: args[0],
        labels: args[1],
      })
    )

    return createResponse(res, octokitRes =>
      octokitRes.data.map(issue => normalizeIssueFromRest(issue))
    )
  }

  private async getIssuesWithFilter(...args: GetIssuesWithFilterRpcArgs) {
    const res = await to(
      this.octokit.graphql<GraphqlIssuesResponse>(query.getIssuesWithFilter(), {
        owner: this.config.user,
        name: this.config.repo,
        first: DEFAULT_PAGINATION_SIZE,
        after: args[0] || undefined,
        labels: isEmpty(args[1]) ? undefined : args[1],
      })
    )

    return createResponse(res, octokitRes =>
      octokitRes.repository.issues.nodes.map(node => normalizeIssueFromGraphql(node))
    )
  }

  private async updateIssue(...args: UpdateIssueRpcArgs) {
    const params: UpdateIssueParams = {
      issue_number: args[0],
      title: args[1],
      body: args[2],
      labels: JSON.parse(args[3]),
    }
    const res = await to(
      this.octokit.request(APIS.UPDATE_ISSUE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => normalizeIssueFromRest(octokitRes.data))
  }

  private async createIssue(...args: CreateIssueRpcArgs) {
    const params: CreateIssueParams = {
      title: args[0],
      body: args[1],
      labels: JSON.parse(args[2]),
    }
    const res = await to(
      this.octokit.request(APIS.CREATE_ISSUE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => normalizeIssueFromRest(octokitRes.data))
  }

  private async uploadImage(content: string, path: string) {
    const res = await to(
      this.octokit.request(APIS.UPLOAD_IMAGE, {
        owner: this.config.user,
        repo: this.config.repo,
        branch: this.config.branch,
        message: 'chore: upload image',
        content,
        path,
      })
    )

    return createResponse(res, () => [
      {
        url: cdnURL({
          user: this.config.user,
          repo: this.config.repo,
          branch: this.config.branch,
          filePath: path,
        }),
      },
    ])
  }

  private async getIssueCount() {
    const res = await to(
      this.octokit.graphql<GraphqlIssueCountResponse>(
        query.getIssueCount({username: this.config.user, repository: this.config.repo})
      )
    )

    return createResponse(res, octokitRes => octokitRes.repository.issues.totalCount)
  }

  private async getIssueCountWithFilter(title: string, labels: string) {
    const res = await to<GraphqlIssueCountWithFilterResponse>(
      this.octokit.graphql(
        query.getIssueCountWithFilter({
          username: this.config.user,
          repository: this.config.repo,
          title,
          labels,
        })
      )
    )

    return createResponse(res, octokitRes => octokitRes.search.issueCount)
  }

  private async getRef() {
    const res = await to(
      this.octokit.request(APIS.GET_REF, {
        owner: this.config.user,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async getCommit(...args: GetCommitRpcArgs) {
    const params: GetCommitParams = {
      commit_sha: args[0],
    }
    const res = await to(
      this.octokit.request(APIS.GET_COMMIT, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async createBlob(...args: CreateBlobRpcArgs) {
    const params: CreateBlobParams = {
      content: args[0],
    }
    const res = await to(
      this.octokit.request(APIS.CREATE_BLOB, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async createTree(...args: CreateTreeRpcArgs) {
    const params: CreateTreeParams = {
      base_tree: args[0],
      tree: [{path: args[1], mode: '100644', type: 'blob', sha: args[2]}],
    }
    const res = await to(
      this.octokit.request(APIS.CREATE_TREE, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async createCommit(...args: CreateCommitRpcArgs) {
    const params: CreateCommitParams = {
      parents: [args[0]],
      tree: args[1],
      message: args[2],
    }
    const res = await to(
      this.octokit.request(APIS.CREATE_COMMIT, {
        owner: this.config.user,
        repo: this.config.repo,
        ...params,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async updateRef(...args: UpdateRefRpcArgs) {
    const params: UpdateRefParams = {
      sha: args[0],
    }
    const res = await to(
      this.octokit.request(APIS.UPDATE_REF, {
        owner: this.config.user,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
        ...params,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async getRepo() {
    const res = await to(
      this.octokit.request(APIS.GET_REPO, {
        owner: this.config.user,
        repo: this.config.repo,
      })
    )

    return createResponse(res, octokitRes => octokitRes.data)
  }

  private async getPageCursor(page: number) {
    if (page <= 1) return null

    const chunkLimit = GRAPHQL_PAGINATION_SIZE_LIMIT
    const targetIndex = (page - 1) * DEFAULT_PAGINATION_SIZE
    const loopCount = Math.ceil(targetIndex / chunkLimit)
    let startCursor: string | null = null

    for (let i = 0; i < loopCount; i++) {
      const isLast = i === loopCount - 1
      const first = isLast ? targetIndex % chunkLimit : chunkLimit

      const res = await to(
        this.octokit.graphql<GraphqlPageCursorResponse>(query.getIssuePageCursor(), {
          owner: this.config.user,
          name: this.config.repo,
          first,
          after: startCursor,
        })
      )

      if (!res[1]) return null

      startCursor = res[1].repository.issues.pageInfo.endCursor
      const hasNextPage = res[1].repository.issues.pageInfo.hasNextPage

      if (!hasNextPage) break
    }

    return startCursor
  }

  private registerRpcListener() {
    const labelHandlers = {
      [MESSAGE_TYPE.GET_LABELS]: this.getLabels,
      [MESSAGE_TYPE.DELETE_LABEL]: this.deleteLabel,
      [MESSAGE_TYPE.CREATE_LABEL]: this.createLabel,
      [MESSAGE_TYPE.UPDATE_LABEL]: this.updateLabel,
    }

    const issueHandlers = {
      [MESSAGE_TYPE.GET_ISSUES]: this.getIssues,
      [MESSAGE_TYPE.GET_ISSUES_WITH_FILTER]: this.getIssuesWithFilter,
      [MESSAGE_TYPE.UPDATE_ISSUE]: this.updateIssue,
      [MESSAGE_TYPE.CREATE_ISSUE]: this.createIssue,
      [MESSAGE_TYPE.GET_ISSUE_COUNT]: this.getIssueCount,
      [MESSAGE_TYPE.GET_ISSUE_COUNT_WITH_FILTER]: this.getIssueCountWithFilter,
    }

    const gitHandlers = {
      [MESSAGE_TYPE.GET_REF]: this.getRef,
      [MESSAGE_TYPE.UPDATE_REF]: this.updateRef,
      [MESSAGE_TYPE.GET_COMMIT]: this.getCommit,
      [MESSAGE_TYPE.CREATE_COMMIT]: this.createCommit,
      [MESSAGE_TYPE.CREATE_BLOB]: this.createBlob,
      [MESSAGE_TYPE.CREATE_TREE]: this.createTree,
    }

    const otherHandlers = {
      [MESSAGE_TYPE.GET_REPO]: this.getRepo,
      [MESSAGE_TYPE.GET_PAGE_CURSOR]: this.getPageCursor,
      [MESSAGE_TYPE.UPLOAD_IMAGE]: this.uploadImage,
    }

    Object.entries({
      ...labelHandlers,
      ...issueHandlers,
      ...gitHandlers,
      ...otherHandlers,
    }).forEach(([type, handler]) => {
      this.rpc.on(type, handler.bind(this))
    })
  }
}
