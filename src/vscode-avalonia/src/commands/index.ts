import * as vscode from "vscode";
import { CommandManager } from "../commandManager";
import { ShowPreviewCommand, ShowPreviewToSideCommand } from "./showPreview";
import { ShowSourceCommand } from "./showSource";

export function registerAvaloniaCommands(commandManager: CommandManager): vscode.Disposable {
	commandManager.register(new ShowPreviewCommand());
	commandManager.register(new ShowPreviewToSideCommand());
	commandManager.register(new ShowSourceCommand());

	return commandManager;
}
