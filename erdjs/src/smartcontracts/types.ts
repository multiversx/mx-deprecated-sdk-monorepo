import { Address } from "../address";
import * as errors from "../errors";

/**
 * Smart enum pattern for primitive types.
 */
export class PrimitiveType {
    private static AllTypes: PrimitiveType[] = [];

    readonly name: string;
    readonly sizeInBytes: number | undefined;
    readonly isNumeric: boolean;
    readonly canCastToNumber: boolean;
    readonly withSign: boolean;

    static U8 = new PrimitiveType({
        name: "U8",
        sizeInBytes: 1,
        isNumeric: true,
        canCastToNumber: true
    });

    static U16 = new PrimitiveType({
        name: "U16",
        sizeInBytes: 2,
        isNumeric: true,
        canCastToNumber: true
    });

    static U32 = new PrimitiveType({
        name: "U32",
        sizeInBytes: 4,
        isNumeric: true,
        canCastToNumber: true
    });

    static U64 = new PrimitiveType({
        name: "U64",
        sizeInBytes: 8,
        isNumeric: true,
        canCastToNumber: false
    });

    static I8 = new PrimitiveType({
        name: "I8",
        sizeInBytes: 1,
        isNumeric: true,
        canCastToNumber: true,
        withSign: true
    });

    static I16 = new PrimitiveType({
        name: "I16",
        sizeInBytes: 2,
        isNumeric: true,
        canCastToNumber: true,
        withSign: true
    });

    static I32 = new PrimitiveType({
        name: "I32",
        sizeInBytes: 4,
        isNumeric: true,
        canCastToNumber: true,
        withSign: true
    });

    static I64 = new PrimitiveType({
        name: "I64",
        sizeInBytes: 8,
        isNumeric: true,
        canCastToNumber: false,
        withSign: true
    });

    static BigUInt = new PrimitiveType({
        name: "BigUInt",
        isNumeric: true,
        canCastToNumber: false,
        withSign: false
    });

    static BigInt = new PrimitiveType({
        name: "BigInt",
        isNumeric: true,
        canCastToNumber: false,
        withSign: true
    });

    static Address = new PrimitiveType({
        name: "Address",
        sizeInBytes: 32
    });

    static Boolean = new PrimitiveType({
        name: "Boolean",
        sizeInBytes: 1
    });

    private constructor(init: Partial<PrimitiveType>) {
        this.name = init.name!;
        this.sizeInBytes = init.sizeInBytes;
        this.isNumeric = init.isNumeric || false;
        this.withSign = init.withSign || false;
        this.canCastToNumber = init.canCastToNumber || false;

        PrimitiveType.AllTypes.push(this);
    }

    hasFixedSize(): boolean {
        return this.sizeInBytes ? true : false;
    }

    hasArbitrarySize(): boolean {
        return !this.hasFixedSize();
    }

    toString(): string {
        return this.name;
    }

    static allTypes(): ReadonlyArray<PrimitiveType> {
        return PrimitiveType.AllTypes;
    }

    static numericTypes(): PrimitiveType[] {
        return PrimitiveType.AllTypes.filter(e => e.isNumeric == true);
    }

    static getByName(name: string): PrimitiveType {
        let result = PrimitiveType.AllTypes.find(item => item.name == name);
        if (!result) {
            throw new errors.ErrUnknownType(name);
        }

        return result;
    }
}

export abstract class CustomType {
    constructor() {
    }
}

export interface IPrimitiveValue {
    getValue(): any;
    canConvertTo(jsType: string): boolean;
    convertTo(jsType: string): any;
}

/**
 * A boolean value fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class BooleanValue implements IPrimitiveValue {
    private readonly value: boolean;

    constructor(value: boolean) {
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

    canConvertTo(jsType: string): boolean {
        return jsType == "boolean";
    }

    convertTo(jsType: string): any {
        if (this.canConvertTo(jsType)) {
            return this.getValue();
        }

        throw new errors.ErrBadTypeConversion(this, jsType);
    }
}

/**
 * A numerical value fed to or fetched from a Smart Contract contract, as a strongly-typed, immutable abstraction.
 */
export class NumericalValue implements IPrimitiveValue {
    readonly value: bigint;
    readonly type: PrimitiveType;
    readonly sizeInBytes: number | undefined;
    readonly withSign: boolean;

    constructor(value: bigint, type: PrimitiveType) {
        this.value = value;
        this.type = type;
        this.sizeInBytes = type.sizeInBytes;
        this.withSign = type.withSign;

        if (typeof (value) != "bigint") {
            throw new errors.ErrInvalidArgument("value", value, "not a bigint");
        }
        if (!type.isNumeric) {
            throw new errors.ErrInvalidArgument("type", type, "isn't numeric");
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

    /**
     * Returns the inner value, as a JavaScript BigInt.
     */
    asBigInt(): bigint {
        return this.value;
    }

    /**
     * Returns the inner value, casted to a JavaScript Number object, if possible.
     */
    asNumber(): number {
        if (this.type.canCastToNumber) {
            return Number(this.value);
        }

        throw new errors.ErrUnsupportedOperation("asNumber", "unsafe casting");
    }

    getValue(): bigint {
        return this.asBigInt();
    }

    canConvertTo(jsType: string): boolean {
        if (jsType == "bigint") {
            return true;
        }

        if (jsType == "number") {
            return this.type.canCastToNumber;
        }

        return false;
    }

    convertTo(jsType: string): any {
        if (jsType == "bigint") {
            return this.asBigInt();
        }

        if (jsType == "number") {
            return this.asNumber();
        }

        throw new errors.ErrBadTypeConversion(this, jsType);
    }
}

/**
 * An address fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class AddressValue implements IPrimitiveValue {
    private readonly value: Address;

    constructor(value: Address) {
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

    canConvertTo(jsType: string): boolean {
        return jsType == "string" || jsType == "Address" || jsType == "Buffer";
    }

    convertTo(jsType: string): any {
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
}

export class OptionalValue {
    private readonly value: any;

    constructor(value: any) {
        if (!isPrimitive(value)) {
            throw new errors.ErrInvalidArgument("value", value, "cannot be wrapped into an optional");
        }

        this.value = value;
    }

    isSet(): boolean {
        return this.value ? true : false;
    }
}

export class Vector {
    private readonly values: any[];

    constructor(values: any[]) {
        this.values = values;
    }
}

export function isPrimitive(value: any) {
    if (value instanceof BooleanValue) {
        return true;
    }
    if (value instanceof NumericalValue) {
        return true;
    }
    if (value instanceof AddressValue) {
        return true;
    }

    return false;
}
