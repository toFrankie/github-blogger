import {Uri, workspace} from 'vscode'

import {EXTENSION_NAME} from '../constants'

/**
 * A helper function that returns a unique alphanumeric identifier called a nonce.
 *
 * @remarks This function is primarily used to help enforce content security
 * policies for resources/scripts being executed in a webview context.
 *
 * @returns A nonce
 */
export function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

/**
 * A helper function which will get the webview URI of a given file or resource.
 *
 * @remarks This URI can be used within a webview's HTML as a link to the
 * given file/resource.
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param pathList An array of strings representing the path to a file/resource
 * @returns A URI pointing to the file/resource
 */
export function getUri(webview, extensionUri, pathList) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList))
}

type settingKeys = 'token' | 'user' | 'repo' | 'branch'

type settingValueMap = {
  token: string | undefined
  user: string | undefined
  repo: string | undefined
  branch: string | undefined
}

export type Settings = {
  [K in settingKeys]: settingValueMap[K]
}

async function getSettingValue<K extends settingKeys>(key: K): Promise<settingValueMap[K]> {
  return workspace.getConfiguration(EXTENSION_NAME).get<settingValueMap[K]>(key)!
}

export async function checkSettings() {
  const [token, user, repo] = await Promise.all([
    getSettingValue('token'),
    getSettingValue('user'),
    getSettingValue('repo'),
  ])
  return Boolean(token && user && repo)
}

export async function getSettings(): Promise<Settings> {
  const [token, user, repo, branch] = await Promise.all([
    getSettingValue('token'),
    getSettingValue('user'),
    getSettingValue('repo'),
    getSettingValue('branch'),
  ])
  return {token, user, repo, branch}
}

export function cdnURL({
  user,
  repo,
  branch,
  filePath,
}: {
  user: string
  repo: string
  branch: string
  filePath: string
}) {
  const tag = branch ? `@${branch}` : ''
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}${tag}/${filePath}`
}

export async function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<[U | null, T | undefined]> {
  try {
    const data = await promise
    const result: [null, T] = [null, data]
    console.log('🚀 to ~ data:', data)
    return result
  } catch (err) {
    console.log('🚀 to ~ err:', err)
    if (errorExt) {
      Object.assign(err as object, errorExt)
    }
    const resultWithError: [U, undefined] = [err as U, undefined]
    return resultWithError
  }
}
