import * as vscode from "vscode";
import path = require("path");
import { logger } from "../util/constants";
import { AppConstants } from "../util/AppConstants";
import { PreviewerData } from "../models/previewerSettings";
import { PreviewProcessManager } from "../previewProcessManager";

export class AvaloniaPreviewPanel {
	public static currentPanel: AvaloniaPreviewPanel | undefined;
	public static readonly viewType = "avalonia.preview";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _context: vscode.ExtensionContext;
	private _disposables: vscode.Disposable[] = [];
	private _processManager: PreviewProcessManager;

	public static createOrShow(
		fileUri: vscode.Uri,
		context: vscode.ExtensionContext,
		processManager: PreviewProcessManager,
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

		AvaloniaPreviewPanel.currentPanel = new AvaloniaPreviewPanel(panel, fileUri, context, processManager);
	}

	public update(filePath: vscode.Uri, previewerData: PreviewerData) {
		const filename = path.basename(filePath.fsPath);
		this._panel.title = `${filename} - Preview`;
		this._panel.iconPath = this.getPreviewPanelIcon(this._context);

		if (previewerData.assetsAvailable && previewerData.previewerUrl) {
			this.getWebview().html = this.getPreviewerHtml(previewerData.previewerUrl);
		} else {
			this.getWebview().html = this.getHtmlForWebview(filePath, previewerData.assetsAvailable ?? false);
		}
	}

	private constructor(
		panel: vscode.WebviewPanel,
		readonly _fileUri: vscode.Uri,
		context: vscode.ExtensionContext,
		processManager: PreviewProcessManager
	) {
		this._panel = panel;
		this._context = context;
		this._processManager = processManager;

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
		this.handleMessage = this.handleMessage.bind(this);

		this.getWebview().onDidReceiveMessage(this.handleMessage, null, this._disposables);
	}

	async handleMessage(message: { command: string }) {
		logger.appendLine(`Received message from webview: ${message.command}`);
		switch (message.command) {
			case "generateAssets":
				await vscode.window.withProgress(
					{ location: vscode.ProgressLocation.Window, cancellable: false },
					async (progress) => {
						progress.report({ message: "Generating preview assets" });
						await vscode.commands.executeCommand("avalonia.createDesignerAssets");
						await vscode.commands.executeCommand(AppConstants.showPreviewToSideCommand, this._fileUri);
					}
				);
				break;
		}
	}

	getPreviewerHtml(url: string) {
		return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Document</title>
			<style>
				html, body {
					margin: 0;
					padding: 0;
				}
				iframe {
					width: 100%;
					height: 100%;
					border: none;
				}
			</style>
		</head>
		<body>
			<div id="app">
				<iframe src="${url}" frameborder="0"></iframe>
			</div>
		</body>
		</html>`;
	}

	getHtmlForWebview(fileUri: vscode.Uri, assetsAvailable: boolean) {
		const extensionUri = this._context.extensionUri;

		const webviewScript = this.getWebview().asWebviewUri(
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
			<div id="details" data-assets="${assetsAvailable}">
				<div id="description">
					Previewer is unavailable. Please build the project to enable it.
				</div>
				<div id="actions">
					<button id="generateAssets">Generate Assets</button>
				</div>
			</div>
			<script nonce="${nonce}" src="${webviewScript}" type="module"></script>
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

	getWebview = () => this._panel.webview;

	public dispose() {
		this._processManager.killPreviewProcess();
		AvaloniaPreviewPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
