import path = require("path");
import * as vscode from "vscode";
import * as sm from "../models/solutionModel";
import { getSolutionModel } from "../services/solutionParser";

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client", { log: true });

export function isAvaloniaFile(document: vscode.TextDocument): boolean {
	return path.extname(document.fileName) === `.${avaloniaFileExtension}`;
}

export function getFileName(filePath: string): string {
	return path.basename(filePath);
}

export function getExecutableProject(solution: sm.Solution): sm.Project | undefined {
	const projs = solution.projects.filter((p) => p.outputType === "WinExe");
	const proj = projs.length > 0 ? projs[0] : undefined;

	return proj;
}

export function getFileDetails(file: string, context: vscode.ExtensionContext): sm.File | undefined {
	const solution = getSolutionModel(context);
	const fileData = solution?.files.find((f) => f.path === file);
	return fileData;
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

	static readonly solutionData = "avalonia.solutionData";

	static readonly updatePreviewerContent = "avalonia.updatePreviewerContext";
}
