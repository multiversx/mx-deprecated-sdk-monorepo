import { Type, PrimitiveType, PrimitiveValue } from "./types";

export class BooleanType extends PrimitiveType {
    constructor() {
        super("Boolean");
    }
}

/**
 * A boolean value fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class BooleanValue extends PrimitiveValue {
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

    valueOf(): boolean {
        return this.value;
    }

    getType(): Type {
        // TODO: return from this.type; (abstract base class should have this field).
        return new BooleanType();
    }
}
