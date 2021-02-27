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

    getLength(): number {
        return this.value.length;
    }

    /**
     * Returns whether two objects have the same value.
     */
    equals(other: BytesValue): boolean {
        return this.value.equals(other.value);
    }

    valueOf(): Buffer {
        return this.value;
    }
}
