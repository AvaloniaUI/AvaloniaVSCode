import * as vscode from "vscode";
import { CommandManager } from "../commandManager";
import { ShowPreviewToSideCommand } from "./ShowPreviewToSideCommand";
import { CreatePreviewerAssets } from "./createPreviewerAssets";
import { PreviewerProcess } from "./previewerProcess";
import { PreviewProcessManager } from "../previewProcessManager";
import { UpdatePreviewerContext } from "./updatePreviewerContent";

const processManager = new PreviewProcessManager();

export function registerAvaloniaCommands(
	commandManager: CommandManager,
	context: vscode.ExtensionContext
): vscode.Disposable {
	commandManager.register(new ShowPreviewToSideCommand(context, processManager));
	commandManager.register(new CreatePreviewerAssets(context));
	commandManager.register(new PreviewerProcess(context, processManager));
	commandManager.register(new UpdatePreviewerContext(context));

	return commandManager;
}
