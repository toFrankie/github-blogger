import {message} from 'antd'
import dayjs from 'dayjs'
import {WebviewRPC} from 'vscode-webview-rpc'
import {MESSAGE_TYPE, SUBMIT_TYPE} from '@/constants'
import type {CreateIssueParams, UpdateIssueParams} from '@/types/issues'
import {generateMarkdown, getVscode} from '@/utils'

const vscode = getVscode()

export const RPC = new WebviewRPC(window, vscode)

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

export async function getMilestones() {
  return await RPC.emit(MESSAGE_TYPE.GET_MILESTONES, [])
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

export async function createIssue(params: CreateIssueParams): Promise<RestIssue> {
  return await RPC.emit(MESSAGE_TYPE.CREATE_ISSUE, [
    params.title,
    params.body,
    JSON.stringify(params.labelNames),
  ])
}

export async function updateIssue(params: UpdateIssueParams): Promise<RestIssue> {
  return await RPC.emit(MESSAGE_TYPE.UPDATE_ISSUE, [
    params.number,
    params.title,
    params.body,
    JSON.stringify(params.labelNames),
  ])
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
