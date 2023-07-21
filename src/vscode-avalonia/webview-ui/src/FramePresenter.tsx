import * as React from "react";
import { PreviewerFrame, PreviewerServerConnection } from "./PreviewerServerConnection";
import { PointerPressedEventMessage } from "./Models/Input/PointerPressedEventMessage";
import { PointerReleasedEventMessage } from "./Models/Input/PointerReleasedEventMessage";
import { PointerMovedEventMessage } from "./Models/Input/PointerMovedEventMessage";
import { ScrollEventMessage } from "./Models/Input/ScrollEventMessage";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface PreviewerPresenterProps {
	conn: PreviewerServerConnection;
}

export class PreviewerPresenter extends React.Component<PreviewerPresenterProps> {
	private canvasRef: React.RefObject<HTMLCanvasElement>;

	constructor(props: PreviewerPresenterProps) {
		super(props);
		this.state = { width: 1, height: 1 };
		this.canvasRef = React.createRef();
		this.componentDidUpdate(
			{
				conn: null!,
			},
			this.state
		);

		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleWheel = this.handleWheel.bind(this);
		this.updateZoom = this.updateZoom.bind(this);
	}

	componentDidMount(): void {
		this.updateCanvas(this.canvasRef.current, this.props.conn.currentFrame);
	}

	componentDidUpdate(prevProps: Readonly<PreviewerPresenterProps>, prevState: Readonly<{}>, snapshot?: any): void {
		if (prevProps.conn !== this.props.conn) {
			if (prevProps.conn) prevProps.conn.removeFrameListener(this.frameHandler);
			if (this.props.conn) this.props.conn.addFrameListener(this.frameHandler);
		}
	}

	private frameHandler = (frame: PreviewerFrame | null) => {
		this.updateCanvas(this.canvasRef.current, frame);
	};

	updateCanvas(canvas: HTMLCanvasElement | null, frame: PreviewerFrame | null) {
		if (!canvas) return;
		if (frame == null) {
			canvas.width = canvas.height = 1;
			canvas.getContext("2d")!.clearRect(0, 0, 1, 1);
		} else {
			canvas.width = frame.data.width;
			canvas.height = frame.data.height;
			const ctx = canvas.getContext("2d")!;
			ctx.putImageData(frame.data, 0, 0);
		}
	}

	handleMouseDown(e: React.MouseEvent) {
		e.preventDefault();
		const pointerPressedEventMessage = new PointerPressedEventMessage(e);
		this.props.conn.sendMouseEvent(pointerPressedEventMessage);
	}

	handleMouseUp(e: React.MouseEvent) {
		e.preventDefault();
		const pointerReleasedEventMessage = new PointerReleasedEventMessage(e);
		this.props.conn.sendMouseEvent(pointerReleasedEventMessage);
	}

	handleMouseMove(e: React.MouseEvent) {
		e.preventDefault();
		const pointerMovedEventMessage = new PointerMovedEventMessage(e);
		this.props.conn.sendMouseEvent(pointerMovedEventMessage);
	}

	handleWheel(e: React.WheelEvent) {
		e.preventDefault();
		const scrollEventMessage = new ScrollEventMessage(e);
		this.props.conn.sendMouseEvent(scrollEventMessage);
	}

	updateZoom(factor: number, reset = false) {
		if (this.canvasRef.current) {
			const currentScale = parseFloat(this.canvasRef.current.style.transform.slice(6)) || 1;
			if (!reset && (currentScale > 2 || currentScale < 0.3)) return;

			console.log(`current scale ${currentScale}`);
			const newScale = reset ? 1 : currentScale * factor;
			this.canvasRef.current.style.transform = `scale(${newScale})`;
		}
	}

	render() {
		return (
			<>
				<canvas
					id="designcanvas"
					ref={this.canvasRef}
					onMouseDown={this.handleMouseDown}
					onMouseUp={this.handleMouseUp}
					onMouseMove={this.handleMouseMove}
					onWheel={this.handleWheel}
				/>
				<section className="zoom-controls">
					<VSCodeButton id="zoom-in" onClick={() => this.updateZoom(1.1)}>
						+
					</VSCodeButton>
					<VSCodeButton id="reset" onClick={() => this.updateZoom(1, true)}>
						Reset
					</VSCodeButton>
					<VSCodeButton id="zoom-out" onClick={() => this.updateZoom(0.9)}>
						-
					</VSCodeButton>
				</section>
			</>
		);
	}
}
