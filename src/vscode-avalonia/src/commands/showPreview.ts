import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger, AppConstants } from "../util/Utilities";
import { PreviewerData, ShowPreviewSettings } from "../models/previewerSettings";
import { PreviewProcessManager } from "../previewProcessManager";
import { PreviewerPanel } from "../panels/PreviewerPanel";

export class ShowPreviewCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = "avalonia.showPreview";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		PreviewerPanel.render(this._context.extensionUri, mainUri!);
	}
}

export class ShowPreviewToSideCommand implements Command {
	constructor(
		private readonly _context: vscode.ExtensionContext,
		private readonly _processManager: PreviewProcessManager
	) {}
	public readonly id = AppConstants.showPreviewToSideCommand;

	public async execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
		let previewerData = this._processManager.getPreviewerData(mainUri?.toString() ?? "");

		if (!previewerData) {
			previewerData = await vscode.commands.executeCommand<PreviewerData>(
				AppConstants.previewProcessCommandId,
				mainUri
			);
		}

		showPreview(this._context, { sideBySide: true }, previewerData, this._processManager);
	}
}

function showPreview(
	context: vscode.ExtensionContext,
	settings: ShowPreviewSettings,
	previewerData: PreviewerData,
	processManager: PreviewProcessManager
) {
	let uri = previewerData.file;

	logger.appendLine(`Show Preview to side: ${uri?.toString() ?? "no mainUri"}`);
	if (!(uri instanceof vscode.Uri) && vscode.window.activeTextEditor) {
		uri = vscode.window.activeTextEditor.document.uri;
	}

	if (!(uri instanceof vscode.Uri) && !vscode.window.activeTextEditor) {
		return;
	}

	if (uri) {
		const resourceColumn =
			(vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;
		const column = settings.sideBySide ? vscode.ViewColumn.Beside : resourceColumn;

		PreviewerPanel.render(context.extensionUri, previewerData.file, column, processManager);

		const message =
			previewerData.assetsAvailable && previewerData.previewerUrl
				? { command: "showPreview", payload: previewerData.previewerUrl }
				: { command: "generateAssets", payload: false };

		PreviewerPanel.currentPanel?.postMessage(message);
	}
}
