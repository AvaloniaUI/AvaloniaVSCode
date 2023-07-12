import * as vscode from "vscode";
import { CommandManager } from "../commandManager";
import { ShowPreviewCommand, ShowPreviewToSideCommand } from "./showPreview";
import { CreatePreviewerAssets } from "./createPreviewerAssets";
import { PreviewerProcess } from "./previewerProcess";
import { PreviewProcessManager } from "../previewProcessManager";

const processManager = new PreviewProcessManager();

export function registerAvaloniaCommands(
	commandManager: CommandManager,
	context: vscode.ExtensionContext
): vscode.Disposable {
	commandManager.register(new ShowPreviewCommand(context));
	commandManager.register(new ShowPreviewToSideCommand(context, processManager));
	//commandManager.register(new ShowSourceCommand());
	commandManager.register(new CreatePreviewerAssets(context));
	commandManager.register(new PreviewerProcess(context, processManager));

	return commandManager;
}
