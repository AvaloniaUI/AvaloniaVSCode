import * as vscode from "vscode";
import * as path from "path";

const extensionId = "AvaloniaTeam.vscode-avalonia";
const dotnetRuntimeVersion = "7.0";

export async function getDotnetRuntimePath(): Promise<string> {
	await vscode.commands.executeCommand("dotnet.showAcquisitionLog");

	const commandRes = await vscode.commands.executeCommand<{ dotnetPath: string }>("dotnet.acquire", {
		version: dotnetRuntimeVersion,
		requestingExtensionId: extensionId,
	});
	const dotnetPath = commandRes!.dotnetPath;
	if (!dotnetPath) {
		throw new Error("Could not resolve the dotnet path!");
	}

	return dotnetPath;
}

export function getLanguageServerPath() {
	const avaloniaExtn = vscode.extensions.getExtension(extensionId);
	if (!avaloniaExtn) {
		throw new Error("Could not find sample extension.");
	}
	const serverLocation = path.join(avaloniaExtn.extensionPath, "avaloniaServer", "AvaloniaLanguageServer.dll");
	return serverLocation;
}
