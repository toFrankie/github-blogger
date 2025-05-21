import dayjs from 'dayjs'
import {WebviewRPC} from 'vscode-webview-rpc'
import {ERROR_TYPE_MAP, MESSAGE_TYPE, SUBMIT_TYPE} from '@/constants'
import {generateMarkdown, getVscode} from '@/utils'

const vscode = getVscode()

export const rpc = new WebviewRPC(window, vscode)

async function rpcEmit<T, A extends any[] = any[]>(
  type: string,
  args: A = [] as unknown as A
): Promise<T> {
  const response = (await rpc.emit(type, args)) as ApiResponse<T>
  if (!response.success) {
    throw new Error(`${ERROR_TYPE_MAP[response.error.type]}: ${response.error.message}`)
  }
  return response.data
}

export async function getRepo() {
  return rpcEmit<RestRepo>(MESSAGE_TYPE.GET_REPO)
}

export async function getLabels() {
  return rpcEmit<MinimalLabels>(MESSAGE_TYPE.GET_LABELS)
}

export async function createLabel(label: Omit<MinimalLabel, 'id'>) {
  const args: CreateLabelRpcArgs = [label.name, label.color, label.description ?? undefined]
  return rpcEmit<MinimalLabel, CreateLabelRpcArgs>(MESSAGE_TYPE.CREATE_LABEL, args)
}

export async function deleteLabel(name: string) {
  await rpcEmit<null, [string]>(MESSAGE_TYPE.DELETE_LABEL, [name])
}

export async function updateLabel(newLabel: Omit<MinimalLabel, 'id'>, oldLabel: MinimalLabel) {
  const newLabelName = newLabel.name !== oldLabel.name ? newLabel.name : undefined
  const args: UpdateLabelRpcArgs = [
    newLabelName,
    oldLabel.name,
    newLabel.color,
    newLabel.description ?? undefined,
  ]
  return rpcEmit<MinimalLabel, UpdateLabelRpcArgs>(MESSAGE_TYPE.UPDATE_LABEL, args)
}

export async function getIssueCount() {
  return rpcEmit<number>(MESSAGE_TYPE.GET_ISSUE_COUNT)
}

export async function getIssueCountWithFilter(
  filterTitle: string,
  filterLabelNames: string[] = []
) {
  if (!filterTitle && filterLabelNames.length === 0) {
    return getIssueCount()
  }

  return rpcEmit<number, [string, string]>(MESSAGE_TYPE.GET_ISSUE_COUNT_WITH_FILTER, [
    filterTitle,
    filterLabelNames.join(','),
  ])
}

export async function getIssues(page: number = 1, labels: string[] = [], title: string = '') {
  let pageCursor: string | null = null

  if (page > 1) {
    pageCursor = await rpcEmit<string | null, [number]>(MESSAGE_TYPE.GET_PAGE_CURSOR, [page])
  }

  const args: GetIssuesWithFilterRpcArgs = [pageCursor, labels, title]
  const res = await rpcEmit<MinimalIssues, GetIssuesWithFilterRpcArgs>(
    MESSAGE_TYPE.GET_ISSUES_WITH_FILTER,
    args
  )
  return res ?? []
}

export async function createIssue(params: MinimalIssue) {
  const labelNames = params.labels.map(label => label.name)
  const args: CreateIssueRpcArgs = [params.title, params.body, JSON.stringify(labelNames)]
  return rpcEmit<MinimalIssue, CreateIssueRpcArgs>(MESSAGE_TYPE.CREATE_ISSUE, args)
}

export async function updateIssue(params: MinimalIssue) {
  const labelNames = params.labels.map(label => label.name)
  const args: UpdateIssueRpcArgs = [
    params.number,
    params.title,
    params.body,
    JSON.stringify(labelNames),
  ]
  return rpcEmit<MinimalIssue, UpdateIssueRpcArgs>(MESSAGE_TYPE.UPDATE_ISSUE, args)
}

type SubmitType = ValueOf<typeof SUBMIT_TYPE>

export async function archiveIssue(issue: MinimalIssue, type: SubmitType) {
  const {number: issueNumber, createdAt} = issue

  if (!Number.isInteger(issueNumber)) return

  // 1. 获取 Ref
  const refResult = await rpcEmit<RestRef>(MESSAGE_TYPE.GET_REF)
  const commitSha = refResult.object.sha

  // 2. 获取当前 Commit 的 Tree SHA
  const commitResult = await rpcEmit<RestCommit, [string]>(MESSAGE_TYPE.GET_COMMIT, [commitSha])
  const treeSha = commitResult.tree.sha

  // 3. 生成 Blob
  const markdown = generateMarkdown(issue)
  const blobResult = await rpcEmit<RestBlob, [string]>(MESSAGE_TYPE.CREATE_BLOB, [markdown])
  const blobSha = blobResult.sha

  // 4. 生成 Tree
  const year = dayjs(createdAt).year()
  const filePath = `archives/${year}/${issueNumber}.md`
  const newTreeResult = await rpcEmit<RestTree, [string, string, string]>(
    MESSAGE_TYPE.CREATE_TREE,
    [treeSha, filePath, blobSha]
  )
  const newTreeSha = newTreeResult.sha

  // 5. 生成 Commit
  const commitMessage =
    type === SUBMIT_TYPE.CREATE
      ? `docs: create issue ${issueNumber}`
      : `docs: update issue ${issueNumber}`
  const newCommitResult = await rpcEmit<RestCommit, [string, string, string]>(
    MESSAGE_TYPE.CREATE_COMMIT,
    [commitSha, newTreeSha, commitMessage]
  )
  const newCommitSha = newCommitResult.sha

  // 6. 更新 Ref
  await rpcEmit<RestRef, [string]>(MESSAGE_TYPE.UPDATE_REF, [newCommitSha])
}

export async function getPageCursor(page: number) {
  return rpcEmit<string | null, [number]>(MESSAGE_TYPE.GET_PAGE_CURSOR, [page])
}
