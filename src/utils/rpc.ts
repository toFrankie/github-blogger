import {message} from 'antd'
import dayjs from 'dayjs'
import {WebviewRPC} from 'vscode-webview-rpc'
import {MESSAGE_TYPE, SUBMIT_TYPE} from '@/constants'
import {generateMarkdown, getVscode} from '@/utils'

const vscode = getVscode()

export const RPC = new WebviewRPC(window, vscode)

export async function getLabels() {
  const labels = await RPC.emit(MESSAGE_TYPE.GET_LABELS, [])
  return labels ?? []
}

export async function createLabel(label: any) {
  await RPC.emit(MESSAGE_TYPE.CREATE_LABEL, [label])
}

export async function deleteLabel(label: any) {
  await RPC.emit(MESSAGE_TYPE.DELETE_LABEL, [label])
}

export async function updateLabel(oldLabel: any, newLabel: any) {
  await RPC.emit(MESSAGE_TYPE.UPDATE_LABEL, [oldLabel, newLabel])
}

export async function getMilestones() {
  return await RPC.emit(MESSAGE_TYPE.GET_MILESTONES, [])
}

export async function getIssueTotalCount(filterLabels: any[] = []) {
  if (filterLabels.length > 0) {
    return await RPC.emit(MESSAGE_TYPE.GET_FILTER_COUNT, [
      filterLabels.map(label => label.name).join(','),
    ])
  }
  return await RPC.emit(MESSAGE_TYPE.GET_TOTAL_COUNT)
}

export async function getIssues(page: number, labels: string[] = [], title: string = '') {
  if (labels.length < 2 && !title) {
    const issues = await RPC.emit(MESSAGE_TYPE.GET_ISSUES, [page, labels.join(',')])
    return issues || []
  }

  const {issues} = await RPC.emit(MESSAGE_TYPE.GET_FILTER_ISSUES, [title, labels.join(','), page])

  return issues
}

export async function createIssue(title: string, body: string, labels: any[]) {
  return await RPC.emit(MESSAGE_TYPE.CREATE_ISSUE, [title, body, JSON.stringify(labels)])
}

export async function updateIssue(number: number, title: string, body: string, labels: any[]) {
  return await RPC.emit(MESSAGE_TYPE.UPDATE_ISSUE, [number, title, body, JSON.stringify(labels)])
}

export async function archiveIssue(
  issue: any,
  type: (typeof SUBMIT_TYPE)[keyof typeof SUBMIT_TYPE]
) {
  try {
    const {number = undefined} = issue
    const createdAt = issue.created_at || issue.createdAt

    if (!Number.isInteger(number)) return

    // 获取 Ref
    const commitSha = await RPC.emit(MESSAGE_TYPE.GET_COMMIT)

    // 获取当前 Commit 的 Tree SHA
    const treeSha = await RPC.emit(MESSAGE_TYPE.GET_TREE, [commitSha])

    // 生成 Blob
    const markdown = generateMarkdown(issue)
    const blobSha = await RPC.emit(MESSAGE_TYPE.CREATE_BLOB, [markdown])

    // 生成 Tree
    const year = dayjs(createdAt).year()
    const filePath = `archives/${year}/${number}.md`
    const newTreeSha = await RPC.emit(MESSAGE_TYPE.CREATE_TREE, [treeSha, filePath, blobSha])

    // 生成 Commit
    const commitMessage =
      type === SUBMIT_TYPE.CREATE ? `docs: create issue ${number}` : `docs: update issue ${number}`
    const newCommitSha = await RPC.emit(MESSAGE_TYPE.CREATE_COMMIT, [
      commitSha,
      newTreeSha,
      commitMessage,
    ])

    //  更新 Ref
    await RPC.emit(MESSAGE_TYPE.UPDATE_REF, [newCommitSha])
  } catch (e) {
    console.log('🚀 ~ archiveIssue failed:', e)
    message.error('Issue Archive Failed')
  }
}
