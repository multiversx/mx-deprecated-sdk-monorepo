import { PrimitiveType, PrimitiveValue } from "./types";

export class BooleanType extends PrimitiveType {
    constructor() {
        super("bool");
    }
}

/**
 * A boolean value fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class BooleanValue extends PrimitiveValue {
    private readonly value: boolean;

    constructor(value: boolean) {
        super(new BooleanType());
        this.value = value;
    }

    /**
     * Returns whether two objects have the same value.
     * 
     * @param other another BooleanValue
     */
    equals(other: BooleanValue): boolean {
        return this.value === other.value;
    }

    isTrue(): boolean {
        return this.value === true;
    }

    isFalse(): boolean {
        return !this.isTrue();
    }

    valueOf(): boolean {
        return this.value;
    }
}
