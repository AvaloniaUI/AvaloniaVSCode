import * as vscode from "vscode";

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client");

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
}
