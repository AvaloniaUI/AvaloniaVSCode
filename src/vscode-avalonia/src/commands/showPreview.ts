import * as vscode from "vscode";
import { Command } from "../commandManager";
import { AvaloniaPreviewPanel } from "../preview/previewPanel";
import { logger } from "../util/constants";
import { AppConstants } from "../util/AppConstants";
import { PreviewerData, ShowPreviewSettings } from "../models/previewerSettings";

export class ShowPreviewCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = "avalonia.showPreview";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
			//TODO: enable later
			// showPreview(this._context, { sideBySide: false }, uri);
			// vscode.commands.executeCommand(AppConstants.previewProcessCommandId, uri);
		}
	}
}

export class ShowPreviewToSideCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = AppConstants.showPreviewToSideCommand;

	public async execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
		var previewerData = await vscode.commands.executeCommand<PreviewerData>(
			AppConstants.previewProcessCommandId,
			mainUri
		);
		showPreview(this._context, { sideBySide: true }, previewerData);
	}
}

function showPreview(context: vscode.ExtensionContext, settings: ShowPreviewSettings, previewerData: PreviewerData) {
	let uri = previewerData.file;

	logger.appendLine(`Show Preview to side: ${uri?.toString() ?? "no mainUri"}`);
	if (!(uri instanceof vscode.Uri) && vscode.window.activeTextEditor) {
		uri = vscode.window.activeTextEditor.document.uri;
	}

	if (!(uri instanceof vscode.Uri) && !vscode.window.activeTextEditor) {
		return;
	}

	const resourceColumn =
		(vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;

	if (uri) {
		const column = settings.sideBySide ? vscode.ViewColumn.Beside : resourceColumn;
		AvaloniaPreviewPanel.createOrShow(uri, context, column);
		AvaloniaPreviewPanel.currentPanel?.update(uri, previewerData);
	}
}
