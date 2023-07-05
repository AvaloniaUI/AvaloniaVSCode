import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger } from "../util/constants";
import { AppConstants } from "../util/AppConstants";
import { PreviewerParams } from "../models/PreviewerParams";
import { spawn } from "child_process";

import * as portfinder from "portfinder";
import * as fs from "fs";
import { PreviewerData } from "../models/previewerSettings";

export class PreviewerProcess implements Command {
	id: string = AppConstants.previewProcessCommandId;

	async execute(mainUri?: vscode.Uri): Promise<PreviewerData> {
		logger.appendLine(`Command ${this.id}, ${mainUri}`);
		let result: PreviewerData = { file: mainUri! };
		const previewParams = this._context.workspaceState.get<PreviewerParams>(AppConstants.previewerParamState);
		if (previewParams && mainUri) {
			result = await this.startPreviewerProcess(previewParams, mainUri);
		}

		return result;
	}

	async startPreviewerProcess(previewParams: PreviewerParams, mainUri: vscode.Uri): Promise<PreviewerData> {
		if (!this.canStartPreviewerProcess(previewParams)) {
			logger.appendLine(`Previewer path not found: ${previewParams.previewerPath}`);
			return { file: mainUri, previewerUrl: "", assetsAvailable: false };
		}

		const port = await portfinder.getPortPromise();
		const htmlUrl = `${AppConstants.localhost}:${port}`;
		const xamlFile = mainUri.toString();

		const previewerArags = [
			"exec",
			`--runtimeconfig ${previewParams.projectRuntimeConfigFilePath}`,
			`--depsfile ${previewParams.projectDepsFilePath} ${previewParams.previewerPath}`,
			`--transport ${xamlFile}`,
			"--method html",
			`--html-url ${htmlUrl}`,
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

		return { file: mainUri, previewerUrl: htmlUrl, assetsAvailable: true };
	}

	canStartPreviewerProcess(previewParams: PreviewerParams) {
		const result =
			fs.existsSync(previewParams.previewerPath) &&
			fs.existsSync(previewParams.projectRuntimeConfigFilePath) &&
			fs.existsSync(previewParams.projectDepsFilePath) &&
			fs.existsSync(previewParams.targetPath);

		return result;
	}
	constructor(private readonly _context: vscode.ExtensionContext) {}
}
