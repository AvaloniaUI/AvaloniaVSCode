import * as vscode from "vscode";
import path = require("path");
import { logger } from "../util/Utilities";
import { PreviewProcessManager } from "../previewProcessManager";

export class WebPreviewerPanel {
	public static currentPanel: WebPreviewerPanel | undefined;

	public static readonly viewType = "webPreviewer";

	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(
		url: string,
		fileUri: vscode.Uri,
		extensionUri: vscode.Uri,
		processManager?: PreviewProcessManager,
		previewColumn: vscode.ViewColumn = vscode.ViewColumn.Active
	) {
		const column = previewColumn || vscode.window.activeTextEditor?.viewColumn;

		// If we already have a p anel, show it.
		if (WebPreviewerPanel.currentPanel) {
			WebPreviewerPanel.currentPanel._panel.reveal(column);
			WebPreviewerPanel.currentPanel._update(url);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			WebPreviewerPanel.viewType,
			"Previewer",
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
			}
		);
		WebPreviewerPanel.currentPanel = new WebPreviewerPanel(panel, url, processManager);

		this.updateTitle(fileUri);
		WebPreviewerPanel.currentPanel._panel.iconPath = {
			dark: vscode.Uri.joinPath(extensionUri, "media", "preview-dark.svg"),
			light: vscode.Uri.joinPath(extensionUri, "media", "preview-light.svg"),
		};
	}

	public static updateTitle(file: vscode.Uri) {
		const currentPanel = WebPreviewerPanel.currentPanel;
		if (currentPanel) {
			currentPanel._panel.title = `Preview ${path.basename(file.fsPath)}`;
		}
	}

	private constructor(
		panel: vscode.WebviewPanel,
		url: string,
		private readonly _processManager?: PreviewProcessManager
	) {
		this._panel = panel;

		// Set the webview's initial html content
		this._update(url);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	/**
	 * Cleans up and disposes of webview resources when the webview panel is closed.
	 */
	public dispose() {
		WebPreviewerPanel.currentPanel = undefined;
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

	private _update(url: string) {
		this._panel.webview.html = this._getHtmlForWebview(url);
	}

	private _getHtmlForWebview(url: string) {
		return `
		<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Web Previewer</title>
            <style>
                .background {display: flex; justify-content: center; background-size: 15px 15px; background-image: linear-gradient(to right, royalblue 0.1px, transparent 1px), linear-gradient(to bottom, royalblue 0.1px, transparent 1px);}
                .preview {min-height: 100vh; min-width: 100vw;}
            </style>
        </head>
        <body class="background">
            <iframe class="preview" src="${url}" marginheight="0" marginwidth="0" frameborder="0"/>
        </body>
        </html>`;
	}
}
