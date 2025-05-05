import dayjs from 'dayjs'
import matter from 'gray-matter'
import {MESSAGE_TYPE} from '@/constants'

export function cdnURL({user, repo, branch, file}) {
  const tag = branch ? `@${branch}` : ''
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}${tag}/${file}`
}

declare global {
  interface Window {
    __vscode__: any
    __settings__: Settings
  }
}

let settings: Settings

export async function getSettings() {
  if (settings) return settings

  const vscode = getVscode()

  return new Promise<Settings>(resolve => {
    const onMessage = (event: MessageEvent) => {
      const message = event.data

      if (message.type === MESSAGE_TYPE.GET_SETTINGS) {
        window.removeEventListener('message', onMessage)
        settings = message.payload
        resolve(settings)
      }
    }

    window.addEventListener('message', onMessage)

    vscode.postMessage({command: MESSAGE_TYPE.GET_SETTINGS})
  })
}

declare global {
  interface Window {
    __vscode__: any
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
    link: issue.url,
    created_at: dayjs(issue.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(issue.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    labels: issue.labels.map(({name}) => name),
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
