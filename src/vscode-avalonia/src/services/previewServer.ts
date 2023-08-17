import * as net from "net";
import { logger } from "../util/Utilities";
import { EventDispatcher, IEvent } from "strongly-typed-events";
import { Messages } from "./messageParser";

export interface IPreviewServer {
	sendData(data: Buffer): void;
}
export class PreviewServer implements IPreviewServer {
	public async start() {
		logger.appendLine(`PreviewServer.start ${this._assemblyName}`);

		this._server.listen(this._port, this._host, () =>
			logger.appendLine(`Preview server listening on port ${this._port}`)
		);
		this._server.on("connection", this.handleSocketEvents.bind(this));
	}

	handleSocketEvents(socket: net.Socket) {
		logger.appendLine(`Preview server connected on port ${socket.localPort}`);
		this._socket = socket;

		socket.on("data", (data) => {
			this._onMessage.dispatch(this, data);
			const msg = Messages.parseIncomingMessage(data);
			logger.appendLine(JSON.stringify(msg.message));
			if (msg.type === Messages.startDesignerSessionMessageId) {
				logger.appendLine("Start designer session message received.");
				const pixelFormat = Messages.clientSupportedPixelFormatsMessage();
				socket.write(pixelFormat);

				const xaml = Messages.updateXaml();
				socket.write(xaml);
			}
		});

		socket.on("close", () => {
			logger.appendLine(`Preview server closed for ${this._assemblyName}`);
			this._server.close();
			this._socket?.destroy();
		});

		socket.on("error", (error) => {
			logger.appendLine(`Preview server error: ${error}`);
		});
	}

	public stop() {
		logger.appendLine(`PreviewServer.stop ${this._assemblyName}`);
		this._server.close();
	}

	public get isRunnig() {
		return this._server?.listening;
	}

	public static getInstance(assemblyName: string, port: number): PreviewServer {
		PreviewServer._instance ??= new PreviewServer(assemblyName, port);
		return PreviewServer._instance;
	}

	private constructor(private _assemblyName: string, private _port: number) {
		this._server = net.createServer();
	}
	sendData(data: Buffer): void {
		logger.appendLine("In PreviewServer.sendData");
	}

	public get onMessage(): IEvent<IPreviewServer, Buffer> {
		return this._onMessage.asEvent();
	}

	_onMessage = new EventDispatcher<IPreviewServer, Buffer>();

	_server: net.Server;
	_socket: net.Socket | undefined;
	_host = "127.0.0.1";

	private static _instance: PreviewServer;
}
