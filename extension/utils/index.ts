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

export async function checkConfig() {
  const [token, user, repo] = await Promise.all([
    workspace.getConfiguration(EXTENSION_NAME).get<string>('token'),
    workspace.getConfiguration(EXTENSION_NAME).get<string>('user'),
    workspace.getConfiguration(EXTENSION_NAME).get<string>('repo'),
  ])
  return Boolean(token && user && repo)
}

export async function getSetting() {
  const [token, user, repo, branch] = await Promise.all([
    workspace.getConfiguration(EXTENSION_NAME).get<string>('token'),
    workspace.getConfiguration(EXTENSION_NAME).get<string>('user'),
    workspace.getConfiguration(EXTENSION_NAME).get<string>('repo'),
    workspace.getConfiguration(EXTENSION_NAME).get<string>('branch'),
  ])
  return {token, user, repo, branch}
}

export const cdnURL = ({
  user,
  repo,
  branch,
  filePath,
}: {
  user: string
  repo: string
  branch: string
  filePath: string
}) => {
  const tag = branch ? `@${branch}` : ''
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}${tag}/${filePath}`
}

export async function to(promise: Promise<any>, errorExt: any) {
  try {
    const data = await promise
    const result = [null, data]
    console.log('data', data)
    return result
  } catch (err: any) {
    console.log('err', err)
    if (errorExt) {
      Object.assign(err, errorExt)
    }
    const resultWithError = [err, undefined]
    return resultWithError
  }
}
