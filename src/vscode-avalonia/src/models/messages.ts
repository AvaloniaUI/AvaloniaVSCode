/**
 * Represents a message containing client render DPI information.
 */
class ClientRenderInfoMessage {
	/**
	 * Creates a new instance of the `ClientRenderInfoMessage` class.
	 * @param dpiX The horizontal DPI value.
	 * @param dpiY The vertical DPI value.
	 */
	constructor(public dpiX: number, public dpiY: number) {}
}

/**
 * Represents a message for starting a designer session.
 */
class StartDesignerSessionMessage {
	/**
	 * The ID of the session.
	 */
	public sessionId?: string;
}
