import * as vscode from "vscode";
import * as path from "path";
import * as lsp from "vscode-languageclient/node";

export async function createLanguageService(context: vscode.ExtensionContext): Promise<lsp.LanguageClient> {
	logger.appendLine("Creating language service");
	const serverPath = getLSPPath(context);

	const serverOptions = getServerStartupOptions(serverPath);
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

function getServerStartupOptions(serverPath: string): lsp.ServerOptions {
	const dotnetCommandPath = "/usr/local/share/dotnet/dotnet";
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

function getLSPPath(context: vscode.ExtensionContext) {
	const serverPath = context.asAbsolutePath("avaloniaServer/AvaloniaLanguageServer.dll");
	return path.resolve(serverPath);
}

export const avaloniaFileExtension = "axaml";
export const avaloniaLanguageId = "axaml";
export const logger = vscode.window.createOutputChannel("Avalonia Client");
