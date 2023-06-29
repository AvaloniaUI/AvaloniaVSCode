import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger } from "../client";
import { AvaloniaPreviewPanel } from "../preview/previewPanel";

export class ShowPreviewCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = "avalonia.showPreview";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
			showPreview(this._context, { sideBySide: false }, uri);
		}
	}
}

export class ShowPreviewToSideCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = "avalonia.showPreviewToSide";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		showPreview(this._context, { sideBySide: true }, mainUri);
	}
}

function showPreview(context: vscode.ExtensionContext, settings: ShowPreviewSettings, uri?: vscode.Uri) {
	logger.appendLine(`Show Preview to side: ${uri?.toString() ?? "no mainUri"}`);
	let resource = uri;
	if (!(resource instanceof vscode.Uri) && vscode.window.activeTextEditor) {
		resource = vscode.window.activeTextEditor.document.uri;
	}

	if (!(resource instanceof vscode.Uri)) {
		if (!vscode.window.activeTextEditor) {
			return vscode.commands.executeCommand("avalonia.showSource");
		}
		return;
	}

	const resourceColumn =
		(vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;

	if (resource) {
		const column = settings.sideBySide ? vscode.ViewColumn.Beside : resourceColumn;
		AvaloniaPreviewPanel.createOrShow(resource, context, column);
		AvaloniaPreviewPanel.currentPanel?.update(resource);
	}
}

interface ShowPreviewSettings {
	readonly sideBySide?: boolean;
	readonly locked?: boolean;
}
