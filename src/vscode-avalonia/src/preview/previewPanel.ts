import * as vscode from "vscode";
import { logger } from "../client";
import path = require("path");

export class AvaloniaPreviewPanel {
	public static currentPanel: AvaloniaPreviewPanel | undefined;
	public static readonly viewType = "avalonia.preview";

	private readonly _panel: vscode.WebviewPanel;
	private readonly _fileUri: vscode.Uri;
	private readonly _context: vscode.ExtensionContext;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(fileUri: vscode.Uri, context: vscode.ExtensionContext) {
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		// If we already have a panel, show it.
		if (AvaloniaPreviewPanel.currentPanel) {
			AvaloniaPreviewPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			AvaloniaPreviewPanel.viewType,
			"Preview",
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			}
		);

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

	private constructor(panel: vscode.WebviewPanel, fileUri: vscode.Uri, context: vscode.ExtensionContext) {
		this._panel = panel;
		this._fileUri = fileUri;
		this._context = context;
		//this._panel.iconPath =
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			(message) => {
				logger.appendLine(`Received message: ${message}`);
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
		return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Document</title>
		</head>
		<body>
			<p>${fileUri}</p>
		</body>
		</html>`;
	}

	getPreviewPanelIcon(context: vscode.ExtensionContext) {
		return {
			dark: vscode.Uri.joinPath(context.extensionUri, "media", "preview-dark.svg"),
			light: vscode.Uri.joinPath(context.extensionUri, "media", "preview-light.svg"),
		};
	}
}
