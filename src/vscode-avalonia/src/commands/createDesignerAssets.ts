import * as vscode from "vscode";
import { Command } from "../commandManager";
import { AppConstants, logger } from "../util/constants";
import path = require("path");
import * as fs from "fs-extra";
import { spawn } from "child_process";
import { PreviewerParams } from "../models/PreviewerParams";

export class CreateDesignerAssets implements Command {
	public readonly id = "avalonia.createDesignerAssets";
	async execute(...args: any[]): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			logger.appendLine("No active workspace.");
			return;
		}
		const workspaceFolder = vscode.workspace.workspaceFolders[0];
		const projectPath = path.join(workspaceFolder.uri.fsPath, `${workspaceFolder.name}.csproj`);

		if (fs.pathExistsSync(projectPath)) {
			const output = await generateDesignerAssets(projectPath);
			this._context.workspaceState.update(AppConstants.previewerParamState, output);
			logger.appendLine(`Previewer assets generated at ${output.previewerPath}`);
		}
	}

	constructor(private readonly _context: vscode.ExtensionContext) {}
}

function generateDesignerAssets(projectPath: string): Promise<PreviewerParams> {
	return new Promise((resolve, reject) => {
		const dotnet = spawn("dotnet", [
			"build",
			projectPath,
			"/t:GeneratePreviewerAssets",
			"/consoleloggerparameters:NoSummary",
		]);

		let output: string[] = [];
		dotnet.stdout.on("data", (data) => {
			const outputString = data.toString();
			logger.appendLine(outputString);
			output.push(...outputString.trim().split("\n"));
		});

		dotnet.on("close", (code) => {
			if (code === 0) {
				const previewParams = parseBuildOutput(output);
				resolve(previewParams);
			} else {
				reject(`dotnet build exited with code ${code}`);
			}
		});
	});
}

function parseBuildOutput(output: string[]): PreviewerParams {
	return {
		previewerPath: output.getValue("PreviewerPath"),
		targetPath: output.getValue("TargetPath"),
		projectRuntimeConfigFilePath: output.getValue("ProjectRuntimeConfigFilePath"),
		projectDepsFilePath: output.getValue("ProjectDepsFilePath"),
	};
}
