import * as vscode from "vscode";
import { getUri } from "../util/getUri";
import { getNonce } from "../util/getNouce";
import { logger, AppConstants } from "../util/Utilities";
import { PreviewProcessManager } from "../previewProcessManager";
import path = require("path");

/**
 * This class manages the state and behavior of DesignerPanel webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering DesignerPanel webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class PreviewerPanel {
	public static currentPanel: PreviewerPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	/**
	 * The DesignerPanel class private constructor (called only from the render method).
	 *
	 * @param panel A reference to the webview panel
	 * @param extensionUri The URI of the directory containing the extension
	 */
	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		private readonly _fileUri: vscode.Uri,
		private readonly _processManager?: PreviewProcessManager
	) {
		this._panel = panel;

		// Set an event listener to listen for when the panel is disposed (i.e. when the user closes
		// the panel or when the panel is closed programmatically)
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Set the HTML content for the webview panel
		this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

		// Set an event listener to listen for messages passed from the webview context
		this._setWebviewMessageListener(this._panel.webview);
	}

	/**
	 * Renders the current webview panel if it exists otherwise a new webview panel
	 * will be created and displayed.
	 *
	 * @param extensionUri The URI of the directory containing the extension.
	 */
	public static render(
		extensionUri: vscode.Uri,
		fileUri: vscode.Uri,
		previewColumn: vscode.ViewColumn = vscode.ViewColumn.Active,
		processManager?: PreviewProcessManager
	) {
		const column = previewColumn || vscode.window.activeTextEditor?.viewColumn;
		if (PreviewerPanel.currentPanel) {
			// If the webview panel already exists reveal it
			PreviewerPanel.currentPanel._panel.reveal(column);
		} else {
			// If a webview panel does not already exist create and show a new one
			const panel = vscode.window.createWebviewPanel(AppConstants.previewerPanelViewType, "Preview", column, {
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, "out"),
					vscode.Uri.joinPath(extensionUri, "webview-ui/build"),
				],
			});

			PreviewerPanel.currentPanel = new PreviewerPanel(panel, extensionUri, fileUri, processManager);
		}

		this.updateTitle(fileUri);
		PreviewerPanel.currentPanel._panel.iconPath = {
			dark: vscode.Uri.joinPath(extensionUri, "media", "preview-dark.svg"),
			light: vscode.Uri.joinPath(extensionUri, "media", "preview-light.svg"),
		};
	}

	public static updateTitle(file: vscode.Uri) {
		const currentPanel = PreviewerPanel.currentPanel;
		if (currentPanel) {
			currentPanel._panel.title = `Preview ${path.basename(file.fsPath)}`;
		}
	}

	/**
	 * Cleans up and disposes of webview resources when the webview panel is closed.
	 */
	public dispose() {
		PreviewerPanel.currentPanel = undefined;
		logger.appendLine("Previwer panel disposed");

		// Dispose of the current webview panel
		this._panel.dispose();

		this._processManager?.killPreviewProcess();
		// Dispose of all disposables (i.e. commands) for the current webview panel
		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
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
	 * @param extensionUri The URI of the directory containing the extension
	 * @returns A template string literal containing the HTML that should be
	 * rendered within the webview panel
	 */
	private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
		// The CSS file from the React build output
		const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "static", "css", "main.css"]);
		// The JS file from the React build output
		const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "static", "js", "main.js"]);

		const nonce = getNonce();

		// Tip: Install the es6-string-html VS Code extension to enable code highlighting below
		return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <link rel="stylesheet" type="text/css" href="${stylesUri}" nonce="${nonce}">
          <title>Hello World</title>
        </head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
	}

	public postMessage(message: { command: string; payload?: any }) {
		this._panel.webview.postMessage(message);
	}

	/**
	 * Sets up an event listener to listen for messages passed from the webview context and
	 * executes code based on the message that is recieved.
	 *
	 * @param webview A reference to the extension webview
	 * @param context A reference to the extension context
	 */
	private _setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage(
			async (message: any) => {
				const command = message.command;
				const text = message.text;
				switch (command) {
					case "generateAssetsCommand":
						await vscode.commands.executeCommand(AppConstants.previewerAssetsCommand);
						await vscode.commands.executeCommand(AppConstants.showPreviewToSideCommand, this._fileUri);
				}
			},
			undefined,
			this._disposables
		);
	}
}
