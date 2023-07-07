import * as vscode from "vscode";
import { CommandManager } from "../commandManager";
import { ShowPreviewCommand, ShowPreviewToSideCommand } from "./showPreview";
import { CreateDesignerAssets } from "./createDesignerAssets";
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
	commandManager.register(new CreateDesignerAssets(context));
	commandManager.register(new PreviewerProcess(context, processManager));

	return commandManager;
}
