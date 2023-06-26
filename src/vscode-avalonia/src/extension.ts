// The module 'vscode' contains the VS Code extensibility API

import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";
import { createLanguageService, logger } from "./client";

let languageClient: lsp.LanguageClient | null = null;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mylspclient" is now active!');
	let disposable = vscode.commands.registerCommand("mylspclient.helloWorld", () => {
		vscode.window.showInformationMessage("Hello World from MyLSPClient!");
	});

	context.subscriptions.push(disposable);

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
