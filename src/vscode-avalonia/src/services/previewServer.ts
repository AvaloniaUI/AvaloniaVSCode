import * as net from "net";
import * as portfinder from "portfinder";
import { logger } from "../util/Utilities";
import { EventDispatcher, IEvent } from "strongly-typed-events";

export interface IPreviewServer {
	sendData(data: Buffer): void;
}
export class PreviewServer implements IPreviewServer {
	public async start() {
		logger.appendLine(`PreviewServer.start ${this._assemblyName}`);

		const port = await this.port();
		if (!port) {
			throw new Error("Could not find a free port for the preview server.");
		}

		this._server.listen(port, this._host, () => logger.appendLine(`Preview server listening on port ${port}`));
		this._server.on("connection", this.handleSocketEvents.bind(this));
	}

	handleSocketEvents(socket: net.Socket) {
		logger.appendLine(`Preview server connected on port ${socket.localPort}`);
		this._socket = socket;

		socket.on("data", (data) => {
			this._onMessage.dispatch(this, data);
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

	public async port(): Promise<number | undefined> {
		this._port ??= await portfinder.getPortPromise();
		return this._port;
	}

	public get isRunnig() {
		return this._server?.listening;
	}

	public static getInstance(assemblyName: string): PreviewServer {
		PreviewServer._instance ??= new PreviewServer(assemblyName);
		return PreviewServer._instance;
	}

	private constructor(private _assemblyName: string) {
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
	_port: number | undefined;

	static _instance: PreviewServer;
}
