import * as vscode from "vscode";
import * as path from "path";
import { AppConstants, logger } from "./util/Utilities";

/**
 * The version of the .NET runtime to acquire.
 */
const dotnetRuntimeVersion = "9.0";

interface IDotnetAcquireResult {
    dotnetPath: string;
}

/**
 * Gets the path to the .NET runtime.
 * @returns A promise that resolves to the path to the .NET runtime.
 * @throws An error if the .NET runtime path could not be resolved.
 */
export async function getDotnetRuntimePath(): Promise<string> {
	const path = await vscode.commands.executeCommand<IDotnetAcquireResult>("dotnet.findPath", {
		acquireContext: {
			version: dotnetRuntimeVersion,
			requestingExtensionId: AppConstants.extensionId,
			mode: 'runtime',
			installType: 'global',
			architecture: process.arch
		},
		versionSpecRequirement: 'greater_than_or_equal'
	});

	if (!path) {
		const message = `.NET ${dotnetRuntimeVersion} was not found. Please make sure it's installed globally.`;
		logger.error(message);
		throw new Error(message);
	}

	return path.dotnetPath;
}

/**
 * Gets the path to the Avalonia language server.
 * @returns The path to the Avalonia language server.
 * @throws An error if the extension could not be found.
 */
export function getLanguageServerPath() {
	const avaloniaExtn = vscode.extensions.getExtension(AppConstants.extensionId);
	if (!avaloniaExtn) {
		throw new Error("Could not find Avalonia extension.");
	}
	const serverLocation = path.join(avaloniaExtn.extensionPath, "avaloniaServer", "AvaloniaLanguageServer.dll");
	return serverLocation;
}
