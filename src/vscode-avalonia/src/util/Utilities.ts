import glob = require("glob");
import path = require("path");
import * as vscode from "vscode";

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client");

export function isAvaloniaFile(document: vscode.TextDocument): boolean {
	return path.extname(document.fileName) === `.${avaloniaFileExtension}`;
}

export function getFileName(filePath: string): string {
	return path.basename(filePath);
}

export function getProjectPath() {
	if (!vscode.workspace.workspaceFolders) {
		logger.appendLine("No active workspace.");
		return;
	}

	const workspaceFolder = vscode.workspace.workspaceFolders[0];

	let projSyncPath = path.join(workspaceFolder.uri.fsPath, "**/*.csproj");
	if (process.platform === "win32") {
		projSyncPath = projSyncPath.replace(/\\/g, "/");
	}

	const csprojFiles = glob.sync(projSyncPath);
	if (csprojFiles.length === 0) {
		return undefined;
	}

	return csprojFiles[0];
}

declare global {
	interface Array<T> {
		getValue(property: string): string;
	}
}
Array.prototype.getValue = function (this: string[], property: string): string {
	const value = this.find((line) => line.includes(property));
	return value ? value.split("=")[1].trim() : "";
};

export class AppConstants {
	static readonly previewerParamState = "previewerParams";
	static readonly previewProcessCommandId = "avalonia.previewProcess";
	static readonly localhost = "http://127.0.0.1";
	static webSocketAddress = (port: number) => `ws://127.0.0.1:${port}/ws`;

	static readonly updateAssetsMessages: "updateAssetsMessage";
	static readonly showPreivewMessage: "showPreviewMessage";

	static readonly showPreviewToSideCommand = "avalonia.showPreviewToSide";
	static readonly previewerAssetsCommand = "avalonia.createPreviewerAssets";

	static readonly previewerPanelViewType = "avaloniaPreviewer";
}
