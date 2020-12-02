import * as errors from "../../errors";
import { Address } from "../../address";
import { Type, PrimitiveType, PrimitiveValue } from "./types";

export class AddressType extends PrimitiveType {
    static One = new AddressType();

    private constructor() {
        super("Address");
    }
}

/**
 * An address fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class AddressValue extends PrimitiveValue {
    private readonly value: Address;

    constructor(value: Address) {
        super();
        this.value = value;
    }

    /**
     * Returns whether two objects have the same value.
     * 
     * @param other another AddressValue
     */
    equals(other: AddressValue): boolean {
        return this.value.equals(other.value);
    }

    valueOf(): Address {
        return this.value;
    }

    getType(): Type {
        return AddressType.One;
    }
}
