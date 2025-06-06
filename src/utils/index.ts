import dayjs from 'dayjs'
import matter from 'gray-matter'
import {MESSAGE_TYPE} from '@/constants'

export function cdnURL({
  user,
  repo,
  branch,
  file,
}: {
  user: string
  repo: string
  branch: string
  file: string
}) {
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

export function generateMarkdown(issue: MinimalIssue) {
  return matter.stringify(issue.body, {
    title: issue.title,
    number: `#${issue.number}`,
    link: issue.url,
    created_at: dayjs(issue.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(issue.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    labels: issue.labels.map(({name}) => name),
  })
}

export function checkFileSize(file: File) {
  const isLt2M = file.size / 1024 / 1024 < 2
  return isLt2M
}

export function openExternalLink(url: string) {
  const vscode = getVscode()
  vscode.postMessage({
    command: MESSAGE_TYPE.OPEN_EXTERNAL_LINK,
    externalLink: url,
  })
}
