import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";
import { getDotnetRuntimePath, getLanguageServerPath as getAvaloniaServerPath } from "./runtimeManager";

export async function createLanguageService(): Promise<lsp.LanguageClient> {
	logger.appendLine("Creating language service");

	const serverOptions = await getServerStartupOptions();
	let outputChannel = logger;

	const clientOptions: lsp.LanguageClientOptions = {
		documentSelector: [{ language: avaloniaLanguageId }],
		progressOnInitialization: true,
		outputChannel,
		synchronize: {
			configurationSection: "avalonia",
			fileEvents: vscode.workspace.createFileSystemWatcher("**/*.axaml"),
		},
		middleware: {
			provideDocumentFormattingEdits: (document, options, token, next) =>
				next(
					document,
					{
						...options,
						insertFinalNewline: true,
					},
					token
				),
		},
	};

	const client = new lsp.LanguageClient(avaloniaLanguageId, "Avalonia LSP", serverOptions, clientOptions);

	return client;
}

async function getServerStartupOptions(): Promise<lsp.ServerOptions> {
	const dotnetCommandPath = await getDotnetRuntimePath();
	const serverPath = getAvaloniaServerPath();

	const executable = {
		command: dotnetCommandPath,
		args: [serverPath],
		options: {
			env: process.env,
		},
	};

	return {
		run: executable,
		debug: executable,
	};
}

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client");
