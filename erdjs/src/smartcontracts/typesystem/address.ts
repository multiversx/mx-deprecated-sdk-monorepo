import * as errors from "../../errors";
import { Address } from "../../address";
import { Type, PrimitiveType, PrimitiveValue } from "./types";

export class AddressType extends PrimitiveType {
    static One = new AddressType();

    private constructor() {
        super("Address");
    }

    canConvertTo(jsType: string): boolean {
        return jsType == "string" || jsType == "Address" || jsType == "Buffer";
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

    getValue(): Address {
        return this.value;
    }

    convertTo(jsType: string): any {
        AddressType.One.assertCanConvertTo(jsType);

        if (jsType == "string") {
            return this.value.bech32();
        }

        if (jsType == "Address") {
            return this.value;
        }

        if (jsType == "Buffer") {
            return this.value.pubkey();
        }

        throw new errors.ErrBadTypeConversion(this, jsType);
    }

    getType(): Type {
        return AddressType.One;
    }
}