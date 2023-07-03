import * as vscode from "vscode";
import { Command } from "../commandManager";
import { logger } from "../util/constants";
import path = require("path");
import * as fs from "fs-extra";
import { spawn } from "child_process";

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
			const e = fs.existsSync(output);
			console.log(output);
		}
	}
}

function generateDesignerAssets(projectPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const dotnet = spawn("dotnet", ["build", projectPath, "/t:GeneratePreviewerAssets"]);

		let output: string[] = [];
		dotnet.stdout.on("data", (data) => {
			output.push(data.toString().trim());
		});

		dotnet.on("close", (code) => {
			if (code === 0) {
				const pathline = output.find((line) => line.includes("PreviewerPath"));
				if (!pathline) {
					reject("PreviewerPath not found in output");
					return;
				}
				const path = pathline.split("=")[1].trim();
				resolve(path);
			} else {
				reject(`dotnet build exited with code ${code}`);
			}
		});
	});
}
