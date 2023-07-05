const vscode = acquireVsCodeApi();
window.onload = () => {
	console.info("*** Previewer script loaded ***");

	const generateAssets = document.getElementById("generateAssets") as HTMLButtonElement;
	generateAssets.onclick = () => {
		vscode.postMessage({ command: "generateAssets" });
	};
};
