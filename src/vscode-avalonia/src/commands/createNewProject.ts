import { Command } from "../commandManager";
import { AppConstants } from "../util/Utilities";
import * as vscode from "vscode";

export class CreateNewProject implements Command {
	public readonly id = AppConstants.newProjectCommandId;

	public async execute() {
		vscode.window.showQuickPick(this.projectList).then((selection) => {
			if (!selection) {
				return;
			}
			vscode.window
				.showInputBox({ prompt: "Enter project name", placeHolder: "Avalonia App" })
				.then((projectName) => this.createProject(projectName, selection.key));
		});
	}

	createProject(projectName: string | undefined, template: string) {
		if (!projectName || !template) {
			return;
		}

		console.log(`Creating project ${projectName} from template ${template}`);
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
