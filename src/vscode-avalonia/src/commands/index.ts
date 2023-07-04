import * as vscode from "vscode";
import { CommandManager } from "../commandManager";
import { ShowPreviewCommand, ShowPreviewToSideCommand } from "./showPreview";
import { ShowSourceCommand } from "./showSource";
import { CreateDesignerAssets } from "./createDesignerAssets";
import { PreviewerProcess } from "./previewerProcess";

export function registerAvaloniaCommands(
	commandManager: CommandManager,
	context: vscode.ExtensionContext
): vscode.Disposable {
	commandManager.register(new ShowPreviewCommand(context));
	commandManager.register(new ShowPreviewToSideCommand(context));
	//commandManager.register(new ShowSourceCommand());
	commandManager.register(new CreateDesignerAssets(context));
	commandManager.register(new PreviewerProcess(context));

	return commandManager;
}
