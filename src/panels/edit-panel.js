import path from 'node:path'

import {window, Uri, ViewColumn, ExtensionMode} from 'vscode'

import {getNonce} from '../utils'

export function getWebviewOptions(extensionUri) {
  return {
    // Enable javascript in the webview
    enableScripts: true,
    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [Uri.joinPath(extensionUri, 'dist')],
  }
}

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export default class EditPanel {
  static currentPanel
  static viewType = 'EditPanel'
  _panel
  _disposables = []
  _context

  /**
   * The EditPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param context A reference to the extension context
   */
  constructor(panel, context) {
    this._panel = panel
    this._context = context

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(
      () => {
        this.dispose()
      },
      null,
      this._disposables
    )

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent()

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview)
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param context A reference to the extension context
   */
  static render(context) {
    const {extensionUri} = context

    // If the webview panel already exists reveal it
    if (EditPanel.currentPanel) {
      EditPanel.currentPanel._panel.reveal(ViewColumn.One)
      return
    }

    const column = window.activeTextEditor ? window.activeTextEditor.viewColumn : undefined

    // If a webview panel does not already exist create and show a new one
    const panel = window.createWebviewPanel(
      EditPanel.viewType,
      'Blog Editing',
      column || ViewColumn.One,
      getWebviewOptions(extensionUri)
    )

    EditPanel.currentPanel = new EditPanel(panel, context)
  }

  static revive(panel, extensionUri) {
    EditPanel.currentPanel = new EditPanel(panel, extensionUri)
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  dispose() {
    EditPanel.currentPanel = undefined

    // Dispose of the current webview panel
    this._panel.dispose()

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length > 0) {
      const disposable = this._disposables.pop()
      if (disposable) {
        disposable.dispose()
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param _extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  // eslint-disable-next-line class-methods-use-this
  _getWebviewContent() {
    const isProduction = this._context.extensionMode === ExtensionMode.Production

    console.log('isProduction', isProduction)

    let scriptUri = ''
    if (isProduction) {
      const filePath = Uri.file(
        path.join(this._context.extensionPath, 'dist', 'webview-ui/index.js')
      )
      scriptUri = this._panel.webview.asWebviewUri(filePath).toString()
    } else {
      scriptUri = `http://localhost:8080/index.js`
    }

    const nonce = getNonce()

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  _setWebviewMessageListener(webview) {
    webview.onDidReceiveMessage(
      message => {
        const {command} = message

        switch (command) {
          case 'reload':
            this.html = this.html.replace(/nonce="\w+?"/, `nonce="${getNonce()}"`)
            this.panel.webview.html = this.html
            break

          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)

          default:
        }
      },
      undefined,
      this._disposables
    )
  }
}
