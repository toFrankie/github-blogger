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

export async function getIssueCount() {
  return (await RPC.emit(MESSAGE_TYPE.GET_ISSUE_COUNT)) as number
}

export async function getIssueCountWithFilter(
  filterTitle: string,
  filterLabelNames: string[] = []
) {
  if (!filterTitle && filterLabelNames.length === 0) {
    return getIssueCount()
  }

  return (await RPC.emit(MESSAGE_TYPE.GET_ISSUE_COUNT_WITH_FILTER, [
    filterTitle,
    filterLabelNames.join(','),
  ])) as number
}

export async function getIssues(page: number = 1, labels: string[] = [], title: string = '') {
  let pageCursor: string | null = null

  if (page > 1) {
    pageCursor = (await RPC.emit(MESSAGE_TYPE.GET_PAGE_CURSOR, [page])) as string | null
  }

  const args = [pageCursor, labels, title]
  const issues = (await RPC.emit(MESSAGE_TYPE.GET_ISSUES_WITH_FILTER, args)) as MinimalIssues
  return issues || []
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

type SubmitType = ValueOf<typeof SUBMIT_TYPE>

export async function archiveIssue(issue: MinimalIssue, type: SubmitType) {
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

export async function getPageCursor(page: number) {
  return (await RPC.emit(MESSAGE_TYPE.GET_PAGE_CURSOR, [page])) as string | null
}
