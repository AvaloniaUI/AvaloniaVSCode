import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

import * as vscode from "vscode";

import * as sln from "../models/solutionModel";
import { spawn } from "child_process";

import { AppConstants, logger } from "../util/Utilities";

const extensionId = "AvaloniaTeam.vscode-avalonia";

export async function parseSolution(solutionPath: string = "/Users/prashantvc/repos/MyAppX/MyAppX.sln") {
	const avaloniaExtn = vscode.extensions.getExtension(extensionId);
	if (!avaloniaExtn) {
		throw new Error("Could not find sample extension.");
	}

	const parserLocation = path.join(avaloniaExtn.extensionPath, "solutionParserTool", "SolutionParser");

	return new Promise((resolve, reject) => {
		const previewer = spawn(parserLocation, [solutionPath], {
			env: process.env,
			shell: true,
		});

		previewer.on("spawn", () => {
			logger.appendLine(`Previewer process started with args: ${previewer.spawnargs}`);
		});

		previewer.stdout.on("data", (data) => {
			logger.appendLine(data.toString());
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

export async function getSolutionData(): Promise<sln.Solution> {
	const tmpDirPath = os.tmpdir();
	const filePath = path.join(tmpDirPath, "MyAppX.sln.json");
	const fileContent = await fs.readFile(filePath, "utf-8");
	return JSON.parse(fileContent);
}
