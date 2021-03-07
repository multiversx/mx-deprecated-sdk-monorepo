import * as errors from "../../errors";
import { PrimitiveType, PrimitiveValue } from "./types";

export class TokenIdentifierType extends PrimitiveType {
    constructor() {
        super("TokenIdentifier");
    }
}

export class TokenIdentifierValue extends PrimitiveValue {
    private readonly value: Buffer;

    constructor(value: Buffer) {
        super(new TokenIdentifierType());
        this.value = value;
    }

    getLength(): number {
        return this.value.length;
    }

    /**
     * Returns whether two objects have the same value.
     */
    equals(other: TokenIdentifierValue): boolean {
        if (this.getLength() != other.getLength()) {
            return false;
        }
        
        return this.value.equals(other.value);
    }

    valueOf(): Buffer {
        return this.value;
    }
}
