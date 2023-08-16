import { BSON } from "bson";

export class Messages {
	public static startDesignerSessionMessageId = "854887CF-2694-4EB6-B499-7461B6FB96C7";
	public static clientRenderInfoMessageId = "7A3c25d3-3652-438D-8EF1-86E942CC96C0";

	public static parseIncomingMessage(message: Buffer) {
		const length = message.messageSize();
		const type = message.messageTypeId();
		const msg = message.document();
		console.info(`Message: ${type}, ${length} - ${msg}`);
	}
}

export function readBuffer(buffer: Buffer) {
	const data = buffer.slice(20);
	try {
		const bson = BSON.deserialize(data);
		return bson;
	} catch (error: any) {
		console.error(error.message);
		return "error";
	}
}

export function typeInfo(guid: string) {
	const guidBytes = Buffer.from(guid, "hex");
	return adjustGuidBytes(guidBytes);
}

export function adjustGuidBytes(byteArray: Buffer) {
	byteArray.slice(0, 4).reverse();
	byteArray.slice(4, 6).reverse();
	byteArray.slice(6, 8).reverse();

	return byteArray;
}

declare global {
	interface Buffer {
		messageSize(): number;
		messageTypeId(): string;
		document(): BSON.Document;
	}
}

Buffer.prototype.messageSize = function (this: Buffer): number {
	return this.readInt32LE(0);
};

Buffer.prototype.messageTypeId = function (this: Buffer): string {
	const typeBytes = this.slice(4, 20);
	const typeInfo = adjustGuidBytes(typeBytes);
	return typeInfo.toString("hex").toUpperCase();
};

Buffer.prototype.document = function (this: Buffer): BSON.Document {
	try {
		const data = this.slice(20);
		const bson = BSON.deserialize(data);
		return bson;
	} catch (error: any) {
		console.error(error.message);
		throw error;
	}
};
