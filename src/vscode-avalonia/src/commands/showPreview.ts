import * as vscode from "vscode";
import { Command } from "../commandManager";

interface ShowPrevewSettigns {
	readonly sideBySide?: boolean;
	readonly locked?: boolean;
}

export class ShowPreviewCommand implements Command {
	public readonly id = "avalonia.showPreview";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		vscode.window.showInformationMessage(`Show Preview: ${mainUri?.toString() ?? "no mainUri"}`);
	}
}

export class ShowPreviewToSideCommand implements Command {
	public readonly id = "avalonia.showPreviewToSide";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		vscode.window.showInformationMessage(`Show Preview to side: ${mainUri?.toString() ?? "no mainUri"}`);
	}
}
