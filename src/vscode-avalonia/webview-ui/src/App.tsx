import "./App.css";
import { useEffect, useState } from "react";
import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { PreviewerServerConnection } from "./PreviewerServerConnection";
import { PreviewerPresenter } from "./FramePresenter";

function App() {
	const [previewUrl, setPreviewUrl] = useState("");
	const [assetsAvailable, setAssetsAvailable] = useState(true);
	const [conn, setConn] = useState<PreviewerServerConnection | null>(null);

	const emptyMethod = () => {};

	useEffect(() => {
		return vscode.onMessage((message: any) => {
			const data: IData = message.data;
			switch (data.command) {
				case "showPreview":
					setPreviewUrl(data.payload);
					break;
				case "generateAssets":
					setAssetsAvailable(data.payload);
					break;
				case "enableBuildButton":
					document.getElementById("buildButton")?.removeAttribute("disabled");
					break;
			}
		});
	}, []);

	useEffect(() => {
		if (previewUrl === "") {
			return emptyMethod;
		}
		console.info(`onPreviewUrlChanged ${previewUrl}`);

		if (conn !== null) {
			conn.closeConnection();
			setConn(null);
		}
		setAssetsAvailable(true);
		new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
			const url = new URL(previewUrl);
			const ws = `ws://${url.hostname}:${url.port}/ws`;
			const localConn = new PreviewerServerConnection(ws);

			setAssetsAvailable(true);
			setConn(localConn);
		});

		return emptyMethod;
	}, [previewUrl]);

	return (
		<div id="designframe">
			{!assetsAvailable && (
				<div id="assetsMessage">
					<b>Please build the project to enable previewer</b>
					<div id="actions">
						<VSCodeButton
							id="buildButton"
							onClick={() => {
								console.info("executing generateAssetsCommand");
								vscode.postMessage({ command: "generateAssetsCommand", text: "Build" });
								document.getElementById("buildButton")?.setAttribute("disabled", "true");
							}}
						>
							Build Project
						</VSCodeButton>
					</div>
				</div>
			)}
			{conn !== null && <PreviewerPresenter conn={conn} />}
		</div>
	);
}

interface IData {
	command: string;
	payload: any;
}

export default App;
