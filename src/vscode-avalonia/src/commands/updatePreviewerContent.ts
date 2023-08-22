import * as vscode from "vscode";
import { Command } from "../commandManager";
import { AppConstants } from "../util/Utilities";
import * as util from "../util/Utilities";
import { PreviewServer } from "../services/previewServer";

export class UpdatePreviewerContext implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = AppConstants.updatePreviewerContent;

	public async execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
		if (!mainUri) {
			return;
		}

		const fileData = util.getFileDetails(mainUri.fsPath, this._context);
		if (!fileData) {
			return;
		}
		const xamlText = vscode.window.activeTextEditor?.document.getText() ?? "";
		PreviewServer.getInstanceByAssemblyName(fileData.targetPath)?.updateXaml(fileData, xamlText);
	}
}
