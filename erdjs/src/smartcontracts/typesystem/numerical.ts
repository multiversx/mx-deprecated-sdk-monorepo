import * as errors from "../../errors";
import { guardType } from "../../utils";
import { PrimitiveType, PrimitiveValue, Type } from "./types";

export class NumericalType extends PrimitiveType {
    readonly sizeInBytes: number;
    readonly withSign: boolean;

    protected constructor(name: string, sizeInBytes: number, withSign: boolean) {
        super(name);
        this.sizeInBytes = sizeInBytes;
        this.withSign = withSign;
    }

    hasFixedSize(): boolean {
        return this.sizeInBytes ? true : false;
    }

    hasArbitrarySize(): boolean {
        return !this.hasFixedSize();
    }
}

export class U8Type extends NumericalType {
    constructor() {
        super("U8", 1, false);
    }
}

export class I8Type extends NumericalType {
    constructor() {
        super("I8", 1, true);
    }
}

export class U16Type extends NumericalType {
    constructor() {
        super("U16", 2, false);
    }
}

export class I16Type extends NumericalType {
    constructor() {
        super("I16", 2, true);
    }
}

export class U32Type extends NumericalType {
    constructor() {
        super("U32", 4, false);
    }
}

export class I32Type extends NumericalType {
    constructor() {
        super("I32", 4, true);
    }
}

export class U64Type extends NumericalType {
    constructor() {
        super("U64", 8, false);
    }
}

export class I64Type extends NumericalType {
    constructor() {
        super("I64", 8, true);
    }
}

export class BigUIntType extends NumericalType {
    constructor() {
        super("BigUInt", 0, false);
    }
}

export class BigIntType extends NumericalType {
    constructor() {
        super("BigInt", 0, true);
    }
}

/**
 * A numerical value fed to or fetched from a Smart Contract contract, as a strongly-typed, immutable abstraction.
 */
export class NumericalValue extends PrimitiveValue {
    readonly type: PrimitiveType; // TODO: from base class
    readonly value: bigint;
    readonly sizeInBytes: number | undefined;
    readonly withSign: boolean;

    constructor(value: bigint, type: NumericalType) {
        super();
        guardType("type", NumericalType, type, false);
        
        this.value = value;
        this.type = type;
        this.sizeInBytes = type.sizeInBytes;
        this.withSign = type.withSign;

        if (typeof (value) != "bigint") {
            throw new errors.ErrInvalidArgument("value", value, "not a bigint");
        }
        if (!this.withSign && value < 0) {
            throw new errors.ErrInvalidArgument("value", value, "negative, but type is unsigned");
        }
    }

    /**
     * Returns whether two objects have the same value.
     * 
     * @param other another NumericalValue
     */
    equals(other: NumericalValue): boolean {
        return this.value == other.value;
    }

    valueOf(): bigint {
        return this.value;
    }

    getType(): Type {
        return this.type;
    }
}

export class U8Value extends NumericalValue {
    constructor(value: number | bigint) {
        super(BigInt(value), new U8Type());
    }
}

export class I8Value extends NumericalValue {
    constructor(value: number | bigint) {
        super(BigInt(value), new I8Type());
    }
}

export class U16Value extends NumericalValue {
    constructor(value: number | bigint) {
        super(BigInt(value), new U16Type());
    }
}

export class I16Value extends NumericalValue {
    constructor(value: number | bigint) {
        super(BigInt(value), new I16Type());
    }
}

export class U32Value extends NumericalValue {
    constructor(value: number | bigint) {
        super(BigInt(value), new U32Type());
    }
}

export class I32Value extends NumericalValue {
    constructor(value: number | bigint) {
        super(BigInt(value), new I32Type());
    }
}

export class U64Value extends NumericalValue {
    constructor(value: bigint) {
        super(value, new U64Type());
    }
}

export class I64Value extends NumericalValue {
    constructor(value: bigint) {
        super(value, new I64Type());
    }
}

export class BigUIntValue extends NumericalValue {
    constructor(value: bigint) {
        super(value, new BigUIntType());
    }
}

export class BigIntValue extends NumericalValue {
    constructor(value: bigint) {
        super(value, new BigIntType());
    }
}
