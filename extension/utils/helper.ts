import {Uri, env, type Disposable, type ExtensionContext, type Webview} from 'vscode'

export class WebviewHelper {
  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   */
  public static setupHtml(webview: Webview, context: ExtensionContext) {
    return __getWebviewHtml__({
      serverUrl: process.env.VITE_DEV_SERVER_URL,
      webview,
      context,
    })
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   */
  public static setupWebviewHooks(webview: Webview, disposables: Disposable[]) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const {command, externalLink} = message

        switch (command) {
          case 'openExternalLink':
            void env.openExternal(Uri.parse(externalLink))
            break

          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)

          default:
        }
      },
      undefined,
      disposables
    )
  }
}
