import { PrimitiveType, PrimitiveValue } from "./types";

export class BooleanType extends PrimitiveType {
    constructor() {
        super("Boolean");
    }

    canConvertTo(jsType: string): boolean {
        return jsType == "boolean";
    }
}

/**
 * A boolean value fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class BooleanValue extends PrimitiveValue {
    private readonly type: BooleanType = new BooleanType();
    private readonly value: boolean;

    constructor(value: boolean) {
        super();
        this.value = value;
    }

    /**
     * Returns whether two objects have the same value.
     * 
     * @param other another BooleanValue
     */
    equals(other: BooleanValue): boolean {
        return this.value == other.value;
    }

    isTrue(): boolean {
        return this.value == true;
    }

    isFalse(): boolean {
        return !this.isTrue();
    }

    getValue(): boolean {
        return this.value;
    }

    convertTo(jsType: string): any {
        this.type.assertCanConvertTo(jsType);
        return this.getValue();
    }

    getType(): BooleanType {
        return this.type;
    }
}
