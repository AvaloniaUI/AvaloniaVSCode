import { Command } from "../commandManager";
import { AppConstants, logger } from "../util/Utilities";
import * as vscode from "vscode";
import { spawn } from "child_process";
import path = require("path");

export class CreateNewProject implements Command {
	public readonly id = AppConstants.newProjectCommandId;

	public async execute() {
		const selection = await vscode.window.showQuickPick(this.projectList);
		if (!selection) {
			return;
		}

		const projectName = await vscode.window.showInputBox({
			prompt: "Enter project name",
			placeHolder: "Avalonia App",
		});

		let projectPath = await vscode.window.withProgress<string>(
			{ location: vscode.ProgressLocation.Notification, cancellable: false },
			async (progress) => {
				progress.report({ message: `Creating a new project: ${projectName}` });
				const path = await this.createProject(projectName, selection.key);
				if (!path) {
					vscode.window.showErrorMessage("Failed to create project");
					return "";
				}
				return path;
			}
		);

		if (projectPath === "") {
			vscode.window.showErrorMessage("Failed to create project");
			return;
		}

		const result = await vscode.window.showInformationMessage(
			`Project ${projectName} created at ${projectPath}`,
			"Open",
			"Cancel"
		);

		if (result === "Open") {
			vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), false);
		}
	}

	async createProject(projectName: string | undefined, template: string): Promise<string | undefined> {
		if (!projectName || !template) {
			return;
		}
		const folders = await vscode.window.showOpenDialog({
			openLabel: "Select",
			canSelectFolders: true,
			canSelectFiles: false,
		});

		const folder = folders ? folders[0].fsPath : undefined;
		if (!folder) {
			return;
		}

		const projectPath = path.join(folder, projectName);

		return new Promise((resolve, reject) => {
			const dotnet = spawn("dotnet", ["new", template, "-n", projectName, "-o", projectPath]);
			dotnet.stderr.on("data", (data) => {
				logger.appendLine(`[ERROR]  dotnet new error: ${data}`);
			});
			dotnet.on("close", (code) => {
				if (code === 0) {
					logger.appendLine(`Project ${projectName} created at ${folder}`);
					resolve(projectPath);
				} else {
					reject("Failed to create project");
				}
			});
		});
	}

	projectList = [
		new ProjectTemplate("Avalonia App", "Avalonia Application (.NET Core)", "avalonia.app"),
		new ProjectTemplate("Avalonia MVVM App", "Avalonia MVVM Application (.NET Core)", "avalonia.mvvm"),
		new ProjectTemplate(
			"Avalonia Cross Platform App",
			"Avalonia Cross Platform Application (.NET Core)",
			"avalonia.xplat"
		),
	];
}

class ProjectTemplate implements vscode.QuickPickItem {
	constructor(label: string, details: string, key: string) {
		this.label = label;
		this.detail = details;
		this.key = key;
	}
	label: string;
	detail?: string | undefined;
	key: string;
}
