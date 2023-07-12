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
		console.info("onMessage, useEffect");
		return vscode.onMessage((message: any) => {
			const data: IData = message.data;
			console.info(data);
			switch (data.command) {
				case "showPreview":
					setPreviewUrl(data.payload);
					break;
				case "generateAssets":
					setAssetsAvailable(data.payload);
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
		new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
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
			{conn !== null && <PreviewerPresenter conn={conn} />}
		</div>
	);
}

interface IData {
	command: string;
	payload: any;
}

export default App;
