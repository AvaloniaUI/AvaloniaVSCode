import * as vscode from "vscode";
import { Command } from "../commandManager";

export class ShowSourceCommand implements Command {
	public readonly id = "avalonia.showSource";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		vscode.window.showInformationMessage(`Show Source: ${mainUri?.toString() ?? "no mainUri"}`);
	}
}
