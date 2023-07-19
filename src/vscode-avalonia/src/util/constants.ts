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

declare global {
	interface Array<T> {
		getValue(property: string): string;
	}
}
Array.prototype.getValue = function (this: string[], property: string): string {
	const value = this.find((line) => line.includes(property));
	return value ? value.split("=")[1].trim() : "";
};
