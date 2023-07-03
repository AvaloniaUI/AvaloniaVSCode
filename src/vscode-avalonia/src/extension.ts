// The module 'vscode' contains the VS Code extensibility API

import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";
import { createLanguageService, logger } from "./client";
import { registerAvaloniaCommands } from "./commands";
import { CommandManager } from "./commandManager";

let languageClient: lsp.LanguageClient | null = null;

export async function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand("avalonia.getTasks", async () => {
		const tasks = await vscode.tasks.fetchTasks();
		tasks.filter((task) => task.name === "build" && task.source === "Workspace");

		const task = tasks[0];
		const tp = await vscode.tasks.executeTask(task);

		vscode.tasks.onDidEndTaskProcess((e) => {
			console.log(e);
		});

		vscode.tasks.onDidEndTask((e) => {
			console.log(e);
		});
	});

	console.log('Congratulations, your extension "Avalonia UI" is now active!');
	const commandManager = new CommandManager();

	context.subscriptions.push(registerAvaloniaCommands(commandManager, context));

	// TODO: Uncomment this when the language server is ready
	// languageClient = await createLanguageService();
	// try {
	// 	logger.appendLine("Starting Avalonia Language Server...");
	// 	await languageClient.start();
	// } catch (error) {
	// 	logger.appendLine(`Failed to start Avalonia Language Server. ${error}`);
	// }
}

// This method is called when your extension is deactivated
export async function deactivate() {
	await languageClient?.stop();
	logger.appendLine("Language client stopped");
}
