import * as vscode from "vscode";
import path = require("path");
import { logger } from "../util/constants";

export class AvaloniaPreviewPanel {
	public static currentPanel: AvaloniaPreviewPanel | undefined;
	public static readonly viewType = "avalonia.preview";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _context: vscode.ExtensionContext;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(
		fileUri: vscode.Uri,
		context: vscode.ExtensionContext,
		previewColumn?: vscode.ViewColumn
	) {
		const column = previewColumn || vscode.window.activeTextEditor?.viewColumn;

		// If we already have a panel, show it.
		if (AvaloniaPreviewPanel.currentPanel) {
			AvaloniaPreviewPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(AvaloniaPreviewPanel.viewType, "Preview", column!, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
		});

		AvaloniaPreviewPanel.currentPanel = new AvaloniaPreviewPanel(panel, fileUri, context);
	}

	public update(filePath: vscode.Uri) {
		const filename = path.basename(filePath.fsPath);
		this._panel.title = `${filename} - Preview`;
		this._panel.iconPath = this.getPreviewPanelIcon(this._context);

		this._panel.webview.html = this._getHtmlForWebview(filePath);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
		AvaloniaPreviewPanel.currentPanel = new AvaloniaPreviewPanel(panel, extensionUri, context);
	}

	private constructor(panel: vscode.WebviewPanel, readonly _fileUri: vscode.Uri, context: vscode.ExtensionContext) {
		this._panel = panel;
		this._context = context;
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			(message) => {
				logger.appendLine(`Received message from webview: ${message.command}`);
				switch (message.command) {
					case "generateAssets":
						vscode.commands.executeCommand("avalonia.createDesignerAssets").then(() => {
							logger.appendLine("Assets generated.");
						});
						break;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		AvaloniaPreviewPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	_getHtmlForWebview(fileUri: vscode.Uri) {
		const extensionUri = this._context.extensionUri;

		const webviewScript = this._panel.webview.asWebviewUri(
			vscode.Uri.joinPath(extensionUri, "out", "preview", "previewScripts.js")
		);

		const nonce = this.getNonce();

		return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Document</title>
			<style>
				body {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100vh;
				}
				#details {
					text-align: center;
				}
				#actions {
					margin: 1rem;
				}
			</style>
		</head>
		<body>
			<div id="details">
				<div id="description">
					Previewer is unavailable. Please build the project to enable it.
				</div>
				<div id="actions">
					<button id="generateAssets">Generate Assets</button>
				</div>
			</div>
			<Script nonce="${nonce}" src="${webviewScript}" type="module"></Script>
		</body>
		</html>`;
	}

	getPreviewPanelIcon(context: vscode.ExtensionContext) {
		return {
			dark: vscode.Uri.joinPath(context.extensionUri, "media", "preview-dark.svg"),
			light: vscode.Uri.joinPath(context.extensionUri, "media", "preview-light.svg"),
		};
	}

	getNonce() {
		let text = "";
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}
