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
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Web Previewer</title>
			<style>
				html,
				body,
				iframe {
					margin: 0;
					padding: 0;
				}

				body {
					background-size: 15px 15px;
					background-image: linear-gradient(to right, var(--vscode-focusBorder) 0.1px, transparent 1px), linear-gradient(to bottom, var(--vscode-focusBorder) 0.1px, transparent 1px);
				}

				button {
					transition-duration: 0.2s;
					border-radius: 100px;
					border: none;
					background: var(--vscode-button-background);
					foreground: var(--vscode-button-foreground);
					min-width: 22px;
					font-size: 18px;
				}
				button:hover {
					background: var(--vscode-button-hoverBackground);
				}

				#menubar {
					background: var(--vscode-tab-activeBackground);
					padding: 5px;
				}

				#preview {
					position: fixed;
					height: 100%;
					width: 100%;
				}
			</style>
		</head>

		<body>
			<div id="menubar">
				<button onclick="Scale(-1)">-</button>
				<button onclick="Scale(1)">+</button>
				<button onclick="Scale(0)" id="scaleBtn"></button>
			</div>
			<iframe src="${url}" frameborder="0" id="preview"></iframe>
			<script>
				var preview = document.getElementById('preview');
				var scaleBtn = document.getElementById('scaleBtn');
				var scale = 1.0;

				scaleBtn.textContent = scale;

				function Scale(direction) {
					if (direction == -1 && scale > 0.25) scale -= 0.25;
					if (direction == 0) scale = 1.0;
					if (direction == 1 && scale < 2) scale += 0.25;

					scaleBtn.textContent = scale;
					preview.style.transformOrigin = 'top left';
					preview.style.scale = scale;
				}
			</script>
		</body>

		</html>`;
	}
}
