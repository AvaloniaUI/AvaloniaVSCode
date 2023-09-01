import path = require("path");
import * as vscode from "vscode";
import * as sm from "../models/solutionModel";
import { getSolutionModel } from "../services/solutionParser";

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client", { log: true });

/**
 * Checks if the given document is an Avalonia file.
 * @param document vscode TextDocument
 * @returns `true` if it's an Avalonia file, `false` otherwise
 */
export function isAvaloniaFile(document: vscode.TextDocument): boolean {
	return path.extname(document.fileName) === `.${avaloniaFileExtension}`;
}

/**
 * Checks if the given document is an Avalonia file.
 * @param filePath file path
 * @returns filename
 */
export function getFileName(filePath: string): string {
	return path.basename(filePath);
}

/**
 * Returns executable project from solution model
 * @param solution solution model
 * @returns executable project
 */
export function getExecutableProject(solution: sm.Solution): sm.Project | undefined {
	const projs = solution.projects.filter((p) => p.outputType === "WinExe");
	const proj = projs.length > 0 ? projs[0] : undefined;

	return proj;
}
/**
 * Returns the file details from solution model
 * @param file file path
 * @param context vscode extension context
 * @returns File details from solution model
 */
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

/**
 * Various app constants
 */
export class AppConstants {
	static readonly insertPropertyCommandId = "avalonia.InsertProperty";
	static readonly previewerParamState = "previewerParams";
	static readonly previewProcessCommandId = "avalonia.previewProcess";
	static readonly localhost = "127.0.0.1";
	static readonly htmlUrl = `http://${AppConstants.localhost}`;

	static webSocketAddress = (port: number) => `ws://${AppConstants.localhost}:${port}/ws`;

	static readonly updateAssetsMessages: "updateAssetsMessage";
	static readonly showPreivewMessage: "showPreviewMessage";

	static readonly showPreviewToSideCommand = "avalonia.showPreviewToSide";
	static readonly previewerAssetsCommand = "avalonia.createPreviewerAssets";

	static readonly previewerPanelViewType = "avaloniaPreviewer";
	static readonly winExe = "WinExe";

	static readonly solutionData = "avalonia.solutionData";

	static readonly updatePreviewerContent = "avalonia.updatePreviewerContext";

	static readonly extensionId = "AvaloniaTeam.vscode-avalonia";
}
