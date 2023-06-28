import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger } from "../client";

export class ShowSourceCommand implements Command {
	public readonly id = "avalonia.showSource";

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]): void {
		logger.appendLine(`Show Source: ${mainUri?.toString() ?? "no mainUri"}`);
	}
}
