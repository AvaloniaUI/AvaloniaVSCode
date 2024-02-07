import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

import * as vscode from "vscode";
//import "vscode"; // required for 'using' statement. Type 'Disposable' must be in global namespace.

import * as sln from "../models/solutionModel";
import { spawn } from "child_process";

import { AppConstants, logger } from "../util/Utilities";

const extensionId = "AvaloniaTeam.vscode-avalonia";

/**
 * Builds the solution model by parsing the solution file and updating the workspace state.
 * If the output file already exists and `force` is false, the function does nothing.
 * @param context The extension context.
 * @param force Whether to force the parsing of the solution file even if the output file already exists.
 */
export async function buildSolutionModel(context: vscode.ExtensionContext, force: boolean = false) {
	var { outputPath, isExist } = await isOutputExists();

	if (!isExist || force) {
		await parseSolution(context);
		return;
	}

	const fileContent = await fs.readFile(outputPath!, "utf-8");
	updateSolutionModel(context, fileContent);
}

/**
 * Returns the solution model from the workspace state.
 * @param context The extension context.
 * @returns The solution model, or undefined if it doesn't exist.
 */
export function getSolutionModel(context: vscode.ExtensionContext): sln.Solution | undefined {
	const solutionData = context.workspaceState.get<sln.Solution | undefined>(AppConstants.solutionData, undefined);
	return solutionData;
}

/**
 * Returns the path to the solution data file.
 * @returns The path to the solution data file, or undefined if it doesn't exist.
 */
export async function getSolutionDataFile() {
	const slnFile = await getSolutionFile();
	if (!slnFile) {
		logger.appendLine("Could not find solution file.");
		return;
	}

	return path.join(os.tmpdir(), path.basename(slnFile) + ".json");
}

/**
 * Deletes the solution data file.
 */
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

/**TODO: Try getting 'current' solution file from exports (or language servers) of
 * ms-dotnettools.csharp (CSharpExtensionExports | OmnisharpExtensionExports),
 * Ionide.Ionide-fsharp (prefers OmniSharp when available),
 * ms-dotnettools.csdevkit (basically Roslyn LSP with VS features)
 */
async function getSolutionFile(): Promise<string | undefined> {
	const filePattern = "**/*.sln";
	const files = await vscode.workspace.findFiles(filePattern);

	if (files.length > 0) {
		if (files.length > 1) {
			// todo: refactor try-catch-finally to `using` statement when electron and vscode support [ECMAScript Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)
			const tokenSource = new (class extends vscode.CancellationTokenSource { /* [Symbol.dispose] = () => { this.dispose(); }; */ });
			try {
				return await vscode.window.showQuickPick(
					files.map((uri) => uri.fsPath),
					{
						title: 'Choose Solution File',
						canPickMany: false
					} as vscode.QuickPickOptions,
					tokenSource.token
				); // may be `undefined`. Why? User cancellation?
			} catch { }
			finally {
				tokenSource.dispose();
			}
		}
		return files[0].fsPath;
	}

	return vscode.workspace.workspaceFolders?.[0].uri.fsPath;
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
		const previewer = spawn(`dotnet`, [parserLocation.putInQuotes(), solutionPath.putInQuotes()], {
			windowsVerbatimArguments: false,
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
			logger.appendLine(`parser process exited ${code}`);
		});
	});
}
