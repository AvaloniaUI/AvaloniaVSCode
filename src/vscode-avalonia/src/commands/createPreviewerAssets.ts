import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger, AppConstants, getProjectPath } from "../util/Utilities";
import path = require("path");
import * as fs from "fs-extra";
import { spawn } from "child_process";
import { PreviewerParams } from "../models/PreviewerParams";
import { DOMParser, XMLSerializer } from "xmldom";

export class CreatePreviewerAssets implements Command {
	public readonly id = AppConstants.previewerAssetsCommand;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	async execute(args: { triggerCodeComplete: boolean } | undefined): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			logger.appendLine("No active workspace.");
			return;
		}
		const workspaceFolder = vscode.workspace.workspaceFolders[0];
		const wsPath = workspaceFolder.uri;
		const projectPath = await getProjectPath();

		if (projectPath && fs.pathExistsSync(projectPath)) {
			await vscode.window.withProgress(
				{ location: vscode.ProgressLocation.Window, cancellable: false },
				async (progress) => {
					progress.report({ message: "Generating preview assets" });
					await this.addPreviewerTarget(projectPath, wsPath);
					const output = await this.generatePreviewerAssets(projectPath);
					this._context.workspaceState.update(AppConstants.previewerParamState, output);
					logger.appendLine(`Previewer assets generated at ${output.previewerPath}`);
				}
			);
		}

		if (args?.triggerCodeComplete) {
			vscode.commands.executeCommand("avalonia.InsertProperty", { repositionCaret: true });
		}
	}

	async addPreviewerTarget(projectPath: string, wsPath: vscode.Uri) {
		const targetFile = vscode.Uri.joinPath(wsPath, ".avalonia", "AvaloniaPreviewer.target");

		if (!fs.existsSync(targetFile.fsPath)) {
			const previewerAssetPath = vscode.Uri.joinPath(
				this._context.extensionUri,
				"assets",
				"AvaloniaPreviewer.target"
			);

			fs.emptyDirSync(path.dirname(targetFile.fsPath));
			fs.copyFileSync(previewerAssetPath.fsPath, targetFile.fsPath, fs.constants.COPYFILE_EXCL);
		}

		const projDir = path.dirname(projectPath);
		const relativeTargetPath = path.relative(projDir, targetFile.fsPath);
		await this.updateProjectFile(projectPath, relativeTargetPath);
		logger.appendLine(`Created a new file: ${relativeTargetPath}`);
	}

	async updateProjectFile(projectPath: string, targetPath: string) {
		var data = await fs.readFile(projectPath, "utf8");

		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(data, "application/xml");

		const imports = xmlDoc.getElementsByTagName("Import");
		const previewerTarget = Array.from(imports).find((i) =>
			i.getAttribute("Project")?.includes("AvaloniaPreviewer.target")
		);

		if (previewerTarget) {
			return;
		}

		const updatedXml = this.createNewImportElement(xmlDoc, targetPath);
		fs.writeFileSync(projectPath, updatedXml, "utf8");
	}

	createNewImportElement(xmlDoc: Document, targetPath: string) {
		const newImport = xmlDoc.createElement("Import");
		newImport.setAttribute("Project", targetPath);
		newImport.setAttribute("Condition", "'$(Configuration)' == 'Debug'");

		const targetParentNode = xmlDoc.getElementsByTagName("Project")[0];
		targetParentNode?.appendChild(newImport);

		const updatedXml = new XMLSerializer().serializeToString(xmlDoc);
		return updatedXml;
	}

	generatePreviewerAssets(projectPath: string): Promise<PreviewerParams> {
		return new Promise((resolve, reject) => {
			const dotnet = spawn("dotnet", [
				"build",
				projectPath,
				"-nologo",
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
					const previewParams = this.parseBuildOutput(output);
					resolve(previewParams);
				} else {
					reject(`dotnet build exited with code ${code}`);
				}
			});
		});
	}

	parseBuildOutput(output: string[]): PreviewerParams {
		return {
			previewerPath: output.getValue("PreviewerPath"),
			targetPath: output.getValue("TargetPath"),
			projectRuntimeConfigFilePath: output.getValue("ProjectRuntimeConfigFilePath"),
			projectDepsFilePath: output.getValue("ProjectDepsFilePath"),
		};
	}
	constructor(private readonly _context: vscode.ExtensionContext) {}
}
