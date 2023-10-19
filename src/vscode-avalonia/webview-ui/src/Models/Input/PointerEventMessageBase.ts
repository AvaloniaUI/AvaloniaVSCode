import * as React from "react";
import { InputEventMessageBase } from "./InputEventMessageBase";

export abstract class PointerEventMessageBase extends InputEventMessageBase {
	public readonly x: number;
	public readonly y: number;

	protected constructor(e: React.MouseEvent, offeset: { x: number; y: number }) {
		super(e);
		this.x = e.clientX - offeset.x;
		this.y = e.clientY - offeset.y;

		console.log(`PointerEventMessageBase: ${this.x}, ${this.y}`);
	}
}
