import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger } from "../client";

export class CreateDesignerAssets implements Command {
	public readonly id = "avalonia.createDesignerAssets";
	async execute(...args: any[]): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			logger.appendLine("No active workspace.");
			return;
		}

		await vscode.commands.executeCommand("dotnet.restore.all");

		// const files = await vscode.workspace.findFiles("**/launch.json");
		// logger.appendLine(`Found ${files.length} launch.json files.`);

		// const wsedit = new vscode.WorkspaceEdit();
		// const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		// const filePath = vscode.Uri.file(wsPath + "/.avalonia/DesignerAssets.target");
		// wsedit.createFile(filePath, { ignoreIfExists: true });
		// vscode.workspace.applyEdit(wsedit);

		// vscode.window.showInformationMessage(`Created a new file: ${filePath}`);
	}
}
