import {Uri, env, type Disposable, type ExtensionContext, type Webview} from 'vscode'

export class WebviewHelper {
  public static setupHtml(webview: Webview, context: ExtensionContext) {
    return process.env.VITE_DEV_SERVER_URL
      ? __getWebviewHtml__(process.env.VITE_DEV_SERVER_URL)
      : __getWebviewHtml__(webview, context)
  }

  public static setupWebviewHooks(webview: Webview, disposables: Disposable[]) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const {command, externalLink} = message

        switch (command) {
          case 'openExternalLink':
            env.openExternal(Uri.parse(externalLink))
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
