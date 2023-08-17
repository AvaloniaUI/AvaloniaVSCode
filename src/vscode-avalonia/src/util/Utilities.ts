import glob = require("glob");
import path = require("path");
import * as vscode from "vscode";
import { DOMParser } from "xmldom";
import * as fs from "fs-extra";

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client");

export function isAvaloniaFile(document: vscode.TextDocument): boolean {
	return path.extname(document.fileName) === `.${avaloniaFileExtension}`;
}

export function getFileName(filePath: string): string {
	return path.basename(filePath);
}

export async function getProjectPath() {
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

	for (let i = 0; i < csprojFiles.length; i++) {
		const element = csprojFiles[i];
		if (await isWinExeProject(element)) {
			return element;
		}
	}

	return csprojFiles[0];
}

async function isWinExeProject(fileName: string): Promise<boolean> {
	var data = await fs.readFile(fileName, "utf8");
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(data, "text/xml");
	const value = xmlDoc.getElementsByTagName("OutputType")[0].textContent;
	return value === "WinExe";
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
	static readonly localhost = "127.0.0.1";
	static readonly htmlUrl = `http://${AppConstants.localhost}`;

	static webSocketAddress = (port: number) => `ws://${AppConstants.localhost}:${port}/ws`;

	static readonly updateAssetsMessages: "updateAssetsMessage";
	static readonly showPreivewMessage: "showPreviewMessage";

	static readonly showPreviewToSideCommand = "avalonia.showPreviewToSide";
	static readonly showPreviewCommand = "avalonia.showPreview";
	static readonly previewerAssetsCommand = "avalonia.createPreviewerAssets";

	static readonly previewerPanelViewType = "avaloniaPreviewer";
	static readonly winExe = "WinExe";
}
