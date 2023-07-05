import * as vscode from "vscode";
export interface ShowPreviewSettings {
	readonly sideBySide?: boolean;
	readonly locked?: boolean;
}

export interface PreviewerData {
	readonly file: vscode.Uri;
	readonly previewerUrl?: string;
	readonly assetsAvailable?: boolean;
}
