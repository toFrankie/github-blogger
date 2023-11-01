// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import EditPanel, {getWebviewOptions} from './panels/edit-panel'
import MultiSelectInput from './panels/multi-select-input'
import {checkConfig} from './utils'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "github-blogger" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposableOpen = vscode.commands.registerCommand('github-blogger.open', async () => {
    if (!(await checkConfig())) {
      return MultiSelectInput(context)
    }

    EditPanel.render(context)
  })

  const disposableConfig = vscode.commands.registerCommand('github-blogger.config', () => {
    MultiSelectInput(context)
  })

  context.subscriptions.push(disposableOpen, disposableConfig)

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(EditPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel) {
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri)
        EditPanel.revive(webviewPanel, context.extensionUri)
      },
    })
  }
}
