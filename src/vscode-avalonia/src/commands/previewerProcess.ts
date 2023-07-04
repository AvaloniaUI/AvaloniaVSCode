import * as vscode from "vscode";
import { Command } from "../commandManager";
import { AppConstants, logger } from "../util/constants";
import { PreviewerParams } from "../models/PreviewerParams";
import { spawn } from "child_process";

import * as portfinder from "portfinder";

export class PreviewerProcess implements Command {
	id: string = AppConstants.previewProcessCommandId;
	async execute(mainUri?: vscode.Uri) {
		logger.appendLine(`Command ${this.id}, ${mainUri}`);
		const previewParams = this._context.workspaceState.get<PreviewerParams>(AppConstants.previewerParamState);
		if (previewParams && mainUri) {
			await this.startPreviewerProcess(previewParams, mainUri.toString());
		}
	}

	async startPreviewerProcess(previewParams: PreviewerParams, xamlFile: string) {
		const port = await portfinder.getPortPromise();

		const previewerArags = [
			"exec",
			`--runtimeconfig ${previewParams.projectRuntimeConfigFilePath}`,
			`--depsfile ${previewParams.projectDepsFilePath} ${previewParams.previewerPath}`,
			`--transport ${xamlFile}`,
			"--method html",
			`--html-url ${AppConstants.localhost}:${port}`,
			previewParams.targetPath,
		];

		const previewer = spawn("dotnet", previewerArags, {
			env: process.env,
			shell: true,
		});

		previewer.stdout.on("data", (data) => {
			logger.appendLine(data.toString());
		});

		previewer.stderr.on("data", (data) => {
			logger.appendLine(data.toString());
			console.error(data.toString());
		});

		previewer.on("close", (code) => {
			logger.appendLine(`Previewer process exited with code ${code}`);
		});

		logger.appendLine(`Starting previewer process pid: ${previewer.pid}`);
	}

	constructor(private readonly _context: vscode.ExtensionContext) {}
}
