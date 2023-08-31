import * as vscode from "vscode";
import { Command } from "../commandManager";
import { AppConstants, logger } from "../util/Utilities";
import { PreviewerData, ShowPreviewSettings } from "../models/previewerSettings";
import { PreviewProcessManager } from "../previewProcessManager";
import { PreviewerPanel } from "../panels/PreviewerPanel";

export class ShowPreviewToSideCommand implements Command {
	constructor(
		private readonly _context: vscode.ExtensionContext,
		private readonly _processManager: PreviewProcessManager
	) {}
	public readonly id = AppConstants.showPreviewToSideCommand;

	public async execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
		const activeFile = mainUri ?? vscode.window.activeTextEditor?.document.uri;

		let previewerData = this._processManager.getPreviewerData(activeFile?.toString() ?? "");

		if (!previewerData) {
			previewerData = await vscode.commands.executeCommand<PreviewerData>(
				AppConstants.previewProcessCommandId,
				activeFile
			);
		}

		showPreview(this._context, { sideBySide: true }, previewerData, this._processManager);

		new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
			vscode.commands.executeCommand(AppConstants.updatePreviewerContent, activeFile);
		});
	}
}

export function showPreview(
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
