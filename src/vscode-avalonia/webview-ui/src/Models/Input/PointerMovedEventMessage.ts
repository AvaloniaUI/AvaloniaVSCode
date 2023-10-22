import * as React from "react";
import { PointerEventMessageBase } from "./PointerEventMessageBase";

export class PointerMovedEventMessage extends PointerEventMessageBase {
	constructor(e: React.MouseEvent, offeset: { x: number; y: number } = { x: 0, y: 0 }) {
		super(e, offeset);
	}

	public toString = (): string => {
		return `pointer-moved:${this.modifiers}:${this.x}:${this.y}`;
	};
}
