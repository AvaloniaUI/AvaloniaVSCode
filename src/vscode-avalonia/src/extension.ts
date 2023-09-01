// The module 'vscode' contains the VS Code extensibility API

import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";
import { createLanguageService } from "./client";
import { registerAvaloniaCommands } from "./commands";
import { CommandManager } from "./commandManager";
import * as util from "./util/Utilities";
import { AppConstants, logger } from "./util/Utilities";
import * as sln from "./services/solutionParser";

let languageClient: lsp.LanguageClient | null = null;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "Avalonia UI" is now active!');

	const commandManager = new CommandManager();

	//TODO: remove this
	await sln.buildSolutionModel(context, true);

	context.subscriptions.push(registerAvaloniaCommands(commandManager, context));

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor && util.isAvaloniaFile(editor.document)) {
			// get avalonia previewer panel from tab groups
			const previewTab = vscode.window.tabGroups.all
				.flatMap((tabGroup) => tabGroup.tabs)
				.find((tab) => {
					const tabInput = tab.input as { viewType: string | undefined };
					if (!tabInput || !tabInput.viewType) {
						return false;
					}
					return tabInput.viewType.endsWith(AppConstants.previewerPanelViewType);
				});

			vscode.commands.executeCommand(AppConstants.updatePreviewerContent, editor.document.uri);

			if (!previewTab || previewTab?.label.endsWith(util.getFileName(editor.document.fileName))) {
				return;
			}
		}
	});

	vscode.workspace.onDidSaveTextDocument((document) => {
		if (util.isAvaloniaFile(document)) {
			vscode.commands.executeCommand(AppConstants.updatePreviewerContent, document.uri);
		}
	});

	const insertCmd = vscode.commands.registerTextEditorCommand(
		AppConstants.insertPropertyCommandId,
		(
			textEditor: vscode.TextEditor,
			edit: vscode.TextEditorEdit,
			prop: { repositionCaret: boolean } | undefined
		) => {
			if (prop?.repositionCaret) {
				const cursorPos = textEditor.selection.active;
				const newPos = cursorPos.with(cursorPos.line, cursorPos.character - 1);
				textEditor.selection = new vscode.Selection(newPos, newPos);
			}
			vscode.commands.executeCommand("editor.action.triggerSuggest");
		}
	);
	context.subscriptions.push(insertCmd);

	languageClient = await createLanguageService();

	try {
		logger.appendLine("Starting Avalonia Language Server...");
		await languageClient.start();
	} catch (error) {
		logger.appendLine(`Failed to start Avalonia Language Server. ${error}`);
	}
}

// This method is called when your extension is deactivated
export async function deactivate() {
	await languageClient?.stop();
	logger.appendLine("Language client stopped");
}
