import * as errors from "../../errors";
import { PrimitiveType, PrimitiveValue } from "./types";

export class StringType extends PrimitiveType {
    constructor() {
        super("utf-8 string");
    }
}

export class StringValue extends PrimitiveValue {
    private readonly value: string;

    constructor(value: string) {
        super(new StringType());
        this.value = value;
    }

    /**
     * Creates a StringValue from a utf-8 string.
     */
    static fromUTF8(value: string): StringValue {
        return new StringValue(value);
    }

    /**
     * Creates a StringValue from a hex-encoded string.
     */
    static fromHex(value: string): StringValue {
        let decodedValue = Buffer.from(value, "hex").toString();
        return new StringValue(decodedValue);
    }

    getLength(): number {
        return this.value.length;
    }

    /**
     * Returns whether two objects have the same value.
     */
    equals(other: StringValue): boolean {
        return this.value == other.value;
    }

    valueOf(): string {
        return this.value;
    }
}
