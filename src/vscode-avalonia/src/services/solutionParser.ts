import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

import * as vscode from "vscode";

import * as sln from "../models/solutionModel";
import { spawn } from "child_process";

import { AppConstants, logger } from "../util/Utilities";

const extensionId = "AvaloniaTeam.vscode-avalonia";

export async function buildSolutionModel(): Promise<sln.Solution | undefined> {
	const solutionPath = await getSolutionFile();
	if (!solutionPath) {
		logger.appendLine("Could not find solution file.");
		return;
	}

	var { outputPath, isExist } = isOutputExists(solutionPath);

	if (!isExist) {
		outputPath = await parseSolution(solutionPath);
	}

	const fileContent = await fs.readFile(outputPath!, "utf-8"); // add ! to assert outputPath is not undefined
	const data = JSON.parse(fileContent);

	vscode.workspace.getConfiguration().update(AppConstants.solutionData, data, vscode.ConfigurationTarget.Global);

	return data;
}

export function getSolutionModel(): sln.Solution | undefined {
	const dd = vscode.workspace.getConfiguration().get<sln.Solution | undefined>(AppConstants.solutionData, undefined);
	const serialized = JSON.stringify(dd);
	const deserialized = JSON.parse(serialized);

	return deserialized;
}

async function getSolutionFile(): Promise<string | undefined> {
	const filePattern = "**/*.sln";
	const files = await vscode.workspace.findFiles(filePattern);

	if (files.length > 0) {
		return files[0].fsPath;
	}

	return undefined;
}

function isOutputExists(solutionPath: string) {
	const outputPath = path.join(os.tmpdir(), path.basename(solutionPath) + ".json");
	return { outputPath, isExist: fs.pathExistsSync(outputPath) };
}

async function parseSolution(solutionPath: string) {
	const avaloniaExtn = vscode.extensions.getExtension(extensionId);
	if (!avaloniaExtn) {
		throw new Error("Could not find sample extension.");
	}

	const parserLocation = path.join(avaloniaExtn.extensionPath, "solutionParserTool", "SolutionParser.dll");

	return new Promise<string>((resolve, reject) => {
		const previewer = spawn(`dotnet ${parserLocation}`, [solutionPath], {
			env: process.env,
			shell: true,
		});

		previewer.on("spawn", () => {
			logger.appendLine(`Previewer process started with args: ${previewer.spawnargs}`);
		});

		previewer.stdout.on("data", (data) => {
			resolve(data.toString());
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
