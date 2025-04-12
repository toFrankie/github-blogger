import {message} from 'antd'
import dayjs from 'dayjs'
import {RPC_COMMANDS, SUBMIT_TYPE} from '@/constants'
import {RPC} from '@/service/index'
import {generateMarkdown} from '@/utils'

export const getLabels = async () => {
  const labels = await RPC.emit(RPC_COMMANDS.GET_LABELS, [])
  return labels ?? []
}

export const createLabel = async (label: any) => {
  await RPC.emit(RPC_COMMANDS.CREATE_LABEL, [label])
}

export const deleteLabel = async (label: any) => {
  await RPC.emit(RPC_COMMANDS.DELETE_LABEL, [label])
}

export const updateLabel = async (oldLabel: any, newLabel: any) => {
  await RPC.emit(RPC_COMMANDS.UPDATE_LABEL, [oldLabel, newLabel])
}

export const getMilestones = async () => {
  return await RPC.emit(RPC_COMMANDS.GET_MILESTONES, [])
}

export const getIssueTotalCount = async (filterLabels: any[] = []) => {
  if (filterLabels.length > 0) {
    return await RPC.emit(RPC_COMMANDS.GET_FILTER_COUNT, [
      filterLabels.map(label => label.name).join(','),
    ])
  }
  return await RPC.emit(RPC_COMMANDS.GET_TOTAL_COUNT)
}

export const getIssues = async (
  page: number,
  filterLabels: any[] = [],
  filterTitle: string = ''
) => {
  if (filterLabels.length < 2 && !filterTitle) {
    const issues = await RPC.emit(RPC_COMMANDS.GET_ISSUES, [
      page,
      filterLabels.map(label => label.name).join(','),
    ])
    return issues || []
  }

  const {issues} = await RPC.emit(RPC_COMMANDS.GET_FILTER_ISSUES, [
    filterTitle,
    filterLabels.map(label => label.name).join(','),
    page,
  ])
  return issues
}

export const createIssue = async (title: string, body: string, labels: any[]) => {
  return await RPC.emit(RPC_COMMANDS.CREATE_ISSUE, [title, body, JSON.stringify(labels)])
}

export const updateIssue = async (number: number, title: string, body: string, labels: any[]) => {
  return await RPC.emit(RPC_COMMANDS.UPDATE_ISSUE, [number, title, body, JSON.stringify(labels)])
}

export const archiveIssue = async (
  issue: any,
  type: (typeof SUBMIT_TYPE)[keyof typeof SUBMIT_TYPE]
) => {
  try {
    const {number = undefined} = issue
    const createdAt = issue.created_at || issue.createdAt

    if (!Number.isInteger(number)) return

    // 获取 Ref
    const commitSha = await RPC.emit(RPC_COMMANDS.GET_COMMIT)

    // 获取当前 Commit 的 Tree SHA
    const treeSha = await RPC.emit(RPC_COMMANDS.GET_TREE, [commitSha])

    // 生成 Blob
    const markdown = generateMarkdown(issue)
    const blobSha = await RPC.emit(RPC_COMMANDS.CREATE_BLOB, [markdown])

    // 生成 Tree
    const year = dayjs(createdAt).year()
    const filePath = `archives/${year}/${number}.md`
    const newTreeSha = await RPC.emit(RPC_COMMANDS.CREATE_TREE, [treeSha, filePath, blobSha])

    // 生成 Commit
    const commitMessage =
      type === SUBMIT_TYPE.CREATE ? `docs: create issue ${number}` : `docs: update issue ${number}`
    const newCommitSha = await RPC.emit(RPC_COMMANDS.CREATE_COMMIT, [
      commitSha,
      newTreeSha,
      commitMessage,
    ])

    //  更新 Ref
    await RPC.emit(RPC_COMMANDS.UPDATE_REF, [newCommitSha])
  } catch (e) {
    console.log('🚀 ~ archiveIssue failed:', e)
    message.error('Issue Archive Failed')
  }
}
