import dayjs from 'dayjs'
import matter from 'gray-matter'

export const cdnURL = ({user, repo, branch, file}) => {
  const tag = branch ? `@${branch}` : ''
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}${tag}/${file}`
}

export async function to(promise, errorExt) {
  try {
    const data = await promise
    const res = [null, data]
    return res
  } catch (err) {
    if (errorExt) {
      Object.assign(err, errorExt)
    }
    const res = [err, undefined]
    return res
  }
}

export function getVscode() {
  if (window.__vscode__) {
    return window.__vscode__
  }

  const vscode = acquireVsCodeApi()
  window.__vscode__ = vscode
  return vscode
}

export function generateMarkdown(issue) {
  return matter.stringify(issue.body, {
    title: issue.title,
    number: `#${issue.number}`,
    link: issue.html_url || issue.url,
    created_at: dayjs(issue.created_at || issue.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(issue.updated_at || issue.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    labels: issue.labels?.map(({name}) => name) || [],
  })
}

export function compareIssue(newIssue, oldIssue) {
  if (newIssue.title !== oldIssue.title) return true
  if (newIssue.body !== oldIssue.body) return true
  if (newIssue.labels?.length !== oldIssue.labels?.length) return true

  if (newIssue.labels && oldIssue.labels) {
    for (const label of newIssue.labels) {
      if (oldIssue.labels.findIndex(({id}) => id === label.id) === -1) return true
    }
  }

  return false
}
