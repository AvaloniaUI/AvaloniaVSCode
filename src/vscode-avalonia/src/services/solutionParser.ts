import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

import * as vscode from "vscode";

import * as sln from "../models/solutionModel";
import { spawn } from "child_process";

import { AppConstants, logger } from "../util/Utilities";

const extensionId = "AvaloniaTeam.vscode-avalonia";

export async function buildSolutionModel(context: vscode.ExtensionContext, force: boolean = false) {
	var { outputPath, isExist } = await isOutputExists();

	if (!isExist || force) {
		await parseSolution(context);
		return;
	}

	const fileContent = await fs.readFile(outputPath!, "utf-8");
	updateSolutionModel(context, fileContent);
}

export function getSolutionModel(context: vscode.ExtensionContext): sln.Solution | undefined {
	const solutionData = context.workspaceState.get<sln.Solution | undefined>(AppConstants.solutionData, undefined);
	return solutionData;
}

export async function getSolutionDataFile() {
	const slnFile = await getSolutionFile();
	if (!slnFile) {
		logger.appendLine("Could not find solution file.");
		return;
	}

	return path.join(os.tmpdir(), path.basename(slnFile) + ".json");
}

export async function purgeSolutionDataFile() {
	const solutionDataFile = await getSolutionDataFile();
	if (!solutionDataFile) {
		return;
	}
	fs.removeSync(solutionDataFile);
}

function updateSolutionModel(context: vscode.ExtensionContext, jsonContect: string) {
	const data = JSON.parse(jsonContect);
	context.workspaceState.update(AppConstants.solutionData, data);
}

async function getSolutionFile(): Promise<string | undefined> {
	const filePattern = "**/*.sln";
	const files = await vscode.workspace.findFiles(filePattern);

	if (files.length > 0) {
		return files[0].fsPath;
	}

	return undefined;
}

async function isOutputExists() {
	const outputPath = await getSolutionDataFile();
	logger.appendLine(`[EXT - INFO] Solution data path path: ${outputPath}`);
	return { outputPath, isExist: fs.pathExistsSync(outputPath!) };
}

async function parseSolution(context: vscode.ExtensionContext): Promise<string> {
	const avaloniaExtn = vscode.extensions.getExtension(extensionId);
	if (!avaloniaExtn) {
		throw new Error("Could not find sample extension.");
	}
	const solutionPath = await getSolutionFile();
	if (!solutionPath) {
		throw new Error("Could not find solution file.");
	}

	const parserLocation = path.join(avaloniaExtn.extensionPath, "solutionParserTool", "SolutionParser.dll");

	return new Promise<string>((resolve, reject) => {
		const previewer = spawn(`dotnet ${parserLocation}`, [solutionPath], {
			env: process.env,
			shell: true,
		});

		previewer.on("spawn", () => {
			logger.appendLine(`parser process args: ${previewer.spawnargs}`);
		});

		previewer.stdout.on("data", (data) => {
			const jsonContent = data.toString();
			updateSolutionModel(context, jsonContent);
			resolve(jsonContent);
		});

		previewer.stderr.on("data", (data) => {
			logger.appendLine(data.toString());
			reject(data.toString());
		});

		previewer.on("close", (code) => {
			logger.appendLine(`Previewer process exited with code ${code}`);
		});
	});
}
