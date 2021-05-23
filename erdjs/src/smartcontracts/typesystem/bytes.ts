import * as errors from "../../errors";
import { PrimitiveType, PrimitiveValue } from "./types";

export class BytesType extends PrimitiveType {
    constructor() {
        super("bytes");
    }
}

export class BytesValue extends PrimitiveValue {
    private readonly value: Buffer;

    constructor(value: Buffer) {
        super(new BytesType());
        this.value = value;
    }

    /**
     * Creates a BytesValue from a utf-8 string.
     */
    static fromUTF8(value: string): BytesValue {
        let buffer = Buffer.from(value, "utf-8");
        return new BytesValue(buffer);
    }

    /**
     * Creates a BytesValue from a hex-encoded string.
     */
    static fromHex(value: string): BytesValue {
        let buffer = Buffer.from(value, "hex");
        return new BytesValue(buffer);
    }

    getLength(): number {
        return this.value.length;
    }

    /**
     * Returns whether two objects have the same value.
     */
    equals(other: BytesValue): boolean {
        if (this.getLength() != other.getLength()) {
            return false;
        }

        return this.value.equals(other.value);
    }

    valueOf(): Buffer {
        return this.value;
    }
}
