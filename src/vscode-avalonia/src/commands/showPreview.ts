import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger } from "../client";
import { AvaloniaPreviewPanel } from "../preview/previewPanel";

export class ShowPreviewCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = "avalonia.showPreview";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		showPreview(this._context, mainUri);
	}
}

export class ShowPreviewToSideCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = "avalonia.showPreviewToSide";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		showPreview(this._context, mainUri);
	}
}

function showPreview(context: vscode.ExtensionContext, mainUri?: vscode.Uri) {
	logger.appendLine(`Show Preview to side: ${mainUri?.toString() ?? "no mainUri"}`);

	if (mainUri) {
		AvaloniaPreviewPanel.createOrShow(mainUri, context);
		AvaloniaPreviewPanel.currentPanel?.update(mainUri);
	}
}
