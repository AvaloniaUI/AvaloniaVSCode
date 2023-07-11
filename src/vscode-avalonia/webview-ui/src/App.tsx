import "./App.css";
import { PreviewerServerConnection } from "./PreviewerServerConnection";
import { PreviewerPresenter } from "./FramePresenter";

const conn = new PreviewerServerConnection("ws://127.0.0.1:8002/ws");

function App() {
	return (
		<div id="designframe">
			<PreviewerPresenter conn={conn} />
		</div>
	);
}

export default App;
