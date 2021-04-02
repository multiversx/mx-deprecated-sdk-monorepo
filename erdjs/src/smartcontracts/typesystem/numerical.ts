import * as errors from "../../errors";
import { guardType } from "../../utils";
import { PrimitiveType, PrimitiveValue, Type } from "./types";
import BigNumber from "bignumber.js";

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
        super("u8", 1, false);
    }
}

export class I8Type extends NumericalType {
    constructor() {
        super("i8", 1, true);
    }
}

export class U16Type extends NumericalType {
    constructor() {
        super("u16", 2, false);
    }
}

export class I16Type extends NumericalType {
    constructor() {
        super("i16", 2, true);
    }
}

export class U32Type extends NumericalType {
    constructor() {
        super("u32", 4, false);
    }
}

export class I32Type extends NumericalType {
    constructor() {
        super("i32", 4, true);
    }
}

export class U64Type extends NumericalType {
    constructor() {
        super("u64", 8, false);
    }
}

export class I64Type extends NumericalType {
    constructor() {
        super("i64", 8, true);
    }
}

export class BigUIntType extends NumericalType {
    constructor() {
        super("BigUint", 0, false);
    }
}

export class BigIntType extends NumericalType {
    constructor() {
        super("Bigint", 0, true);
    }
}

/**
 * A numerical value fed to or fetched from a Smart Contract contract, as a strongly-typed, immutable abstraction.
 */
export class NumericalValue extends PrimitiveValue {
    readonly value: BigNumber;
    readonly sizeInBytes: number | undefined;
    readonly withSign: boolean;

    constructor(type: NumericalType, value: BigNumber) {
        super(type);
        guardType("type", NumericalType, type, false);
        
        if (!(value instanceof BigNumber)) {
            throw new errors.ErrInvalidArgument("value", value, "not a big number");
        }
        
        this.value = value;
        this.sizeInBytes = type.sizeInBytes;
        this.withSign = type.withSign;

        if (!this.withSign && value.isNegative()) {
            throw new errors.ErrInvalidArgument("value", value.toString(10), "negative, but type is unsigned");
        }
    }

    /**
     * Returns whether two objects have the same value.
     * 
     * @param other another NumericalValue
     */
    equals(other: NumericalValue): boolean {
        return this.value.isEqualTo(other.value);
    }

    valueOf(): BigNumber {
        return this.value;
    }
}

export class U8Value extends NumericalValue {
    constructor(value: number | BigNumber) {
        super(new U8Type(), new BigNumber(value));
    }
}

export class I8Value extends NumericalValue {
    constructor(value: number | BigNumber) {
        super(new I8Type(), new BigNumber(value));
    }
}

export class U16Value extends NumericalValue {
    constructor(value: number | BigNumber) {
        super(new U16Type(), new BigNumber(value));
    }
}

export class I16Value extends NumericalValue {
    constructor(value: number | BigNumber) {
        super(new I16Type(), new BigNumber(value));
    }
}

export class U32Value extends NumericalValue {
    constructor(value: number | BigNumber) {
        super(new U32Type(), new BigNumber(value));
    }
}

export class I32Value extends NumericalValue {
    constructor(value: number | BigNumber) {
        super(new I32Type(), new BigNumber(value));
    }
}

export class U64Value extends NumericalValue {
    constructor(value: BigNumber) {
        super(new U64Type(), value);
    }
}

export class I64Value extends NumericalValue {
    constructor(value: BigNumber) {
        super(new I64Type(), value);
    }
}

export class BigUIntValue extends NumericalValue {
    constructor(value: BigNumber) {
        super(new BigUIntType(), value);
    }
}

export class BigIntValue extends NumericalValue {
    constructor(value: BigNumber) {
        super(new BigIntType(), value);
    }
}
