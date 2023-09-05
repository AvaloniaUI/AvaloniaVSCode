import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger, AppConstants, getExecutableProject } from "../util/Utilities";
import * as fs from "fs-extra";
import { spawn } from "child_process";
import { PreviewerParams } from "../models/PreviewerParams";
import * as sln from "../services/solutionParser";
import * as sm from "../models/solutionModel";

export class CreatePreviewerAssets implements Command {
	public readonly id = AppConstants.previewerAssetsCommand;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	async execute(args: { triggerCodeComplete: boolean } | undefined): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			logger.appendLine("No active workspace.");
			return;
		}

		const solutionData = sln.getSolutionModel(this._context);
		if (!solutionData) {
			logger.appendLine("No solution data found.");
			sln.buildSolutionModel(this._context);
			return;
		}

		const project = getExecutableProject(solutionData);

		if (!project) {
			logger.appendLine("No executable project found.");
			return;
		}

		const projectPath = project.path;

		if (projectPath && fs.pathExistsSync(projectPath)) {
			await vscode.window.withProgress(
				{ location: vscode.ProgressLocation.Window, cancellable: false },
				async (progress) => {
					progress.report({ message: "Generating preview assets" });

					const output = await this.generatePreviewerAssets(projectPath, project);
					//TODO use this for solution storage
					this._context.workspaceState.update(AppConstants.previewerParamState, output);

					logger.appendLine(`Previewer assets generated at ${output.previewerPath}`);
				}
			);
		}
		if (args?.triggerCodeComplete) {
			vscode.commands.executeCommand(AppConstants.insertPropertyCommandId, { repositionCaret: true });
		}
	}

	generatePreviewerAssets(projectPath: string, project: sm.Project): Promise<PreviewerParams> {
		return new Promise((resolve, reject) => {
			const dotnet = spawn("dotnet", [
				"build",
				projectPath.putInQuotes(),
				"-nologo",
				"/consoleloggerparameters:NoSummary",
			]);
			dotnet.stderr.on("data", (data) => {
				logger.appendLine(`[ERROR]  dotnet build error: ${data}`);
			});
			dotnet.on("close", async (code) => {
				if (code === 0) {
					if (!project.designerHostPath || project.designerHostPath === "") {
						await sln.buildSolutionModel(this._context, true);
					}

					const solution = sln.getSolutionModel(this._context);
					if (!solution) {
						reject("Solution data not found.");
						return;
					}

					const prj = getExecutableProject(solution);
					if (!prj) {
						reject("Executable project not found.");
						return;
					}

					const previewParams = {
						previewerPath: prj.designerHostPath,
						targetPath: prj.targetPath,
						projectRuntimeConfigFilePath: prj.runtimeConfigFilePath,
						projectDepsFilePath: prj.depsFilePath,
					};
					resolve(previewParams);
				} else {
					logger.appendLine(`[ERROR] dotnet build exited with code ${code}`);
					reject(`dotnet build exited with code ${code}`);
				}
			});
		});
	}
	constructor(private readonly _context: vscode.ExtensionContext) {}
}
