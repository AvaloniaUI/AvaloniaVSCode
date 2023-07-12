import "./App.css";
import { useEffect, useState } from "react";
import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

function App() {
	const [fileUrl, setFileUrl] = useState("");
	const [assetsAvailable, setAssetsAvailable] = useState(true);

	useEffect(() => {
		console.info("onMessage, useEffect");
		return vscode.onMessage((message: any) => {
			const data: IData = message.data;
			console.info(data);
			switch (data.command) {
				case "preview":
					setFileUrl(data.payload);
					break;
				case "generateAssets":
					setAssetsAvailable(data.payload);
			}
		});
	}, []);

	useEffect(() => {
		if (fileUrl !== "") {
			console.info(`message changed ${fileUrl}`);
		}
		return () => {};
	}, [fileUrl]);

	return (
		<div id="designframe">
			{!assetsAvailable && (
				<div id="assetsMessage">
					<b>Previewer is unavailable. Please build the project to enable it.</b>
					<div id="actions">
						<VSCodeButton
							onClick={() => {
								console.info("executing generateAssetsCommand");
								vscode.postMessage({ command: "generateAssetsCommand", text: "Generate Assets" });
							}}
						>
							Generate Assets
						</VSCodeButton>
					</div>
				</div>
			)}
			<h2>{fileUrl}</h2>
		</div>
	);
}

interface IData {
	command: string;
	payload: any;
}

export default App;
