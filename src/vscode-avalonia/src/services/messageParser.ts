import { BSON } from "bson";

export class Messages {
	public static startDesignerSessionMessageId = "854887CF26944EB6B4997461B6FB96C7";
	public static clientRenderInfoMessageId = "7A3C25D33652438D8EF186E942CC96C0";
	public static clientSupportedPixelFormats = "63481025701643FEBADCF2FD0F88609E";
	public static updateXamlId = "9AEC9A2E63154066B4BAE9A9EFD0F8CC";

	public static parseIncomingMessage(message: Buffer) {
		const length = message.messageSize();
		const type = message.messageTypeId();
		const msg = message.document();

		return { type: type, message: msg, length: length };
	}

	public static clientSupportedPixelFormatsMessage(): Buffer {
		const message = { formats: [1] };
		return createMessage(message, Messages.clientSupportedPixelFormats);
	}

	public static updateXaml(): Buffer {
		const message = {
			assemblyPath: "/Users/prashantvc/repos/MyAppX/MyAppX/bin/Debug/net7.0/MyAppX.dll",
			xaml: xamlText,
		};
		return createMessage(message, Messages.updateXamlId);
	}
}

function createMessage(message: any, messageType: string) {
	console.log("message", message);
	const bson = BSON.serialize(message);
	const dataLength = bson.length; // 20 is the length of the header
	const total = getLengthBytes(dataLength) + getByString(typeInfo(messageType)) + getByString(bson);
	const messageBytes = Buffer.from(total, "hex");
	return messageBytes;
}

function getLengthBytes(length: number) {
	const hexDataLength = Buffer.alloc(4);
	hexDataLength.writeUInt32LE(length, 0);
	return hexDataLength.toString("hex").toUpperCase();
}

function getByString(byteArray: any) {
	return byteArray.toString("hex").toUpperCase();
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

const xamlText = `<UserControl xmlns="https://github.com/avaloniaui"
xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
xmlns:vm="clr-namespace:MyAppX.ViewModels"
mc:Ignorable="d" d:DesignWidth="800" d:DesignHeight="450"
x:Class="MyAppX.Views.MainView"
x:DataType="vm:MainViewModel">
<Design.DataContext>
<!-- This only sets the DataContext for the previewer in an IDE,
to set the actual DataContext for runtime, set the DataContext property in code (look at App.axaml.cs) -->
<vm:MainViewModel />
</Design.DataContext>

<TextBlock Text="{Binding Greeting}" HorizontalAlignment="Center" VerticalAlignment="Center"/>
</UserControl>`;

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
