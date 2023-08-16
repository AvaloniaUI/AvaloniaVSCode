import { BSON } from "bson";

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
