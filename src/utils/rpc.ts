import {message} from 'antd'
import dayjs from 'dayjs'
import {WebviewRPC} from 'vscode-webview-rpc'
import {MESSAGE_TYPE, SUBMIT_TYPE} from '@/constants'
import {generateMarkdown, getVscode} from '@/utils'

const vscode = getVscode()

export const RPC = new WebviewRPC(window, vscode)

export async function getRepo() {
  return (await RPC.emit(MESSAGE_TYPE.GET_REPO)) as RestRepo
}

export async function getLabels() {
  const labels = (await RPC.emit(MESSAGE_TYPE.GET_LABELS, [])) as MinimalLabels
  return labels ?? []
}

export async function createLabel(label: string) {
  await RPC.emit(MESSAGE_TYPE.CREATE_LABEL, [label])
}

export async function deleteLabel(label: string) {
  await RPC.emit(MESSAGE_TYPE.DELETE_LABEL, [label])
}

export async function updateLabel(oldLabel: string, newLabel: string) {
  await RPC.emit(MESSAGE_TYPE.UPDATE_LABEL, [oldLabel, newLabel])
}

export async function getIssueCount(filterTitle: string, filterLabelNames: string[] = []) {
  if (filterTitle || filterLabelNames.length > 0) {
    return (await RPC.emit(MESSAGE_TYPE.GET_ISSUE_COUNT_WITH_FILTER, [
      filterTitle,
      filterLabelNames.join(','),
    ])) as number
  }
  return (await RPC.emit(MESSAGE_TYPE.GET_ISSUE_COUNT)) as number
}

export async function getIssues(page: number = 1, labels: string[] = [], title: string = '') {
  // 注意 REST API 的 labels 字段 "2017,2018" 是且关系，而 GraphQL API 的 label:2017,2018 是或关系。
  // 按 Label 筛选的功能，预期是或关系。
  if (!title && labels.length < 2) {
    const issues = (await RPC.emit(MESSAGE_TYPE.GET_ISSUES, [
      page,
      labels.join(','),
    ])) as MinimalIssues

    return issues || []
  }

  const issues = (await RPC.emit(MESSAGE_TYPE.GET_ISSUES_WITH_FILTER, [
    page,
    labels.join(','),
    title,
  ])) as MinimalIssues

  return issues
}

export async function createIssue(params: MinimalIssue): Promise<MinimalIssue> {
  const labelNames = params.labels.map(label => label.name)
  const args: CreateIssueRpcArgs = [params.title, params.body, JSON.stringify(labelNames)]
  return await RPC.emit(MESSAGE_TYPE.CREATE_ISSUE, args)
}

export async function updateIssue(params: MinimalIssue): Promise<MinimalIssue> {
  const labelNames = params.labels.map(label => label.name)
  const args: UpdateIssueRpcArgs = [
    params.number,
    params.title,
    params.body,
    JSON.stringify(labelNames),
  ]
  return await RPC.emit(MESSAGE_TYPE.UPDATE_ISSUE, args)
}

export async function archiveIssue(
  issue: MinimalIssue,
  type: (typeof SUBMIT_TYPE)[keyof typeof SUBMIT_TYPE]
) {
  try {
    const {number: issueNumber, createdAt} = issue

    if (!Number.isInteger(issueNumber)) return

    // 1. 获取 Ref
    const refResult = (await RPC.emit(MESSAGE_TYPE.GET_REF)) as RestRef
    const commitSha = refResult.object.sha

    // 2. 获取当前 Commit 的 Tree SHA
    const commitResult = (await RPC.emit(MESSAGE_TYPE.GET_COMMIT, [commitSha])) as RestCommit
    const treeSha = commitResult.tree.sha

    // 3. 生成 Blob
    const markdown = generateMarkdown(issue)
    const blobResult = (await RPC.emit(MESSAGE_TYPE.CREATE_BLOB, [markdown])) as RestBlob
    const blobSha = blobResult.sha

    // 4. 生成 Tree
    const year = dayjs(createdAt).year()
    const filePath = `archives/${year}/${issueNumber}.md`
    const newTreeResult = (await RPC.emit(MESSAGE_TYPE.CREATE_TREE, [
      treeSha,
      filePath,
      blobSha,
    ])) as RestTree
    const newTreeSha = newTreeResult.sha

    // 5. 生成 Commit
    const commitMessage =
      type === SUBMIT_TYPE.CREATE
        ? `docs: create issue ${issueNumber}`
        : `docs: update issue ${issueNumber}`
    const newCommitResult = (await RPC.emit(MESSAGE_TYPE.CREATE_COMMIT, [
      commitSha,
      newTreeSha,
      commitMessage,
    ])) as RestCommit
    const newCommitSha = newCommitResult.sha

    // 6. 更新 Ref
    ;(await RPC.emit(MESSAGE_TYPE.UPDATE_REF, [newCommitSha])) as RestRef
  } catch (e) {
    console.log('🚀 ~ archiveIssue failed:', e)
    message.error('Issue Archive Failed')
  }
}
