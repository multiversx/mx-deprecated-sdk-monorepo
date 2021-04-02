import * as errors from "../../errors";
import { PrimitiveType, PrimitiveValue } from "./types";

export class H256Type extends PrimitiveType {
    constructor() {
        super("H256");
    }
}

export class H256Value extends PrimitiveValue {
    private readonly value: Buffer;

    constructor(value: Buffer) {
        super(new H256Type());
        this.value = value;
    }

    /**
     * Returns whether two objects have the same value.
     */
    equals(other: H256Value): boolean {
        return this.value.equals(other.value);
    }

    valueOf(): Buffer {
        return this.value;
    }
}
