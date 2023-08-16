import * as vscode from "vscode";
import { Command } from "../commandManager";
import { AppConstants } from "../util/Utilities";
import { PreviewServer } from "../services/previewServer";

export class ShowPreviewCommand implements Command {
	constructor(private readonly _context: vscode.ExtensionContext) {}
	public readonly id = AppConstants.showPreviewCommand;

	public async execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
		const previewServer = PreviewServer.getInstance(mainUri!.fsPath);
		if (!previewServer.isRunnig) {
			await previewServer.start();
			vscode.window.showInformationMessage("Preview server started.");
		}
	}
}
