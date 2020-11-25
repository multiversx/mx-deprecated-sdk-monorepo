import { Address } from "../address";
import * as errors from "../errors";

/**
 * Handles nested generic types.
 * A nested type parameter is a type parameter that is also a generic type. 
 */
export class TypeDescriptor {
    private readonly scopedTypes: Type[] = [];

    constructor(scopedTypes: Type[]) {
        this.scopedTypes = scopedTypes;
    }

    scopeInto(): TypeDescriptor {
        return new TypeDescriptor(this.scopedTypes.slice(1));
    }

    /**
     * Will return `true` for types such as Vector, Optional.
     */
    isGenericType(): boolean {
        return this.scopedTypes.length > 1;
    }

    getGenericType(): Type {
        this.assertIsGenericType();
        return this.scopedTypes[0];
    }

    /**
     * Only one (direct) type parameter is supported (e.g. Map<TKey, TValue> isn't supported). The type parameter can be a generic type, though.
     */
    getTypeParameter(): Type {
        this.assertIsGenericType();
        return this.scopedTypes[1];
    }

    private assertIsGenericType() {
        if (!this.isGenericType()) {
            throw new errors.ErrTypingSystem("not a generic type");
        }
    }

    static resolve(scopedTypeNames)
}

export class Type {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export abstract class PrimitiveType extends Type {
    constructor(name: string) {
        super(name);
    }

    abstract canConvertTo(jsType: string): boolean;

    assertCanConvertTo(jsType: string) {
        if (!this.canConvertTo(jsType)) {
            throw new errors.ErrInvariantFailed(`cannot convert ${this.name} to ${jsType}`);
        }
    }
}

export class BooleanType extends PrimitiveType {
    constructor() {
        super("Boolean");
    }

    canConvertTo(jsType: string): boolean {
        return jsType == "boolean";
    }
}

export abstract class NumericalType extends PrimitiveType {
    readonly sizeInBytes: number;
    readonly withSign: boolean;

    constructor(name: string, sizeInBytes: number, withSign: boolean) {
        super(name);
        this.sizeInBytes = sizeInBytes;
        this.withSign = withSign;
    }

    canConvertTo(jsType: string): boolean {
        return jsType == "bigint" || (jsType == "number" && this.sizeInBytes < 8);
    }
}

export abstract class U8Type extends NumericalType {
    constructor() {
        super("U8", 1, false);
    }
}

export abstract class I8Type extends NumericalType {
    constructor() {
        super("I8", 1, true);
    }
}

export abstract class U16Type extends NumericalType {
    constructor() {
        super("U16", 2, false);
    }
}

export abstract class I16Type extends NumericalType {
    constructor() {
        super("I16", 2, true);
    }
}

export abstract class U32Type extends NumericalType {
    constructor() {
        super("U32", 4, false);
    }
}

export abstract class I32Type extends NumericalType {
    constructor() {
        super("I32", 4, true);
    }
}

export abstract class U64Type extends NumericalType {
    constructor() {
        super("U64", 8, false);
    }
}

export abstract class I64Type extends NumericalType {
    constructor() {
        super("I64", 8, true);
    }
}

export abstract class BigUIntType extends NumericalType {
    constructor() {
        super("BigUInt", 0, false);
    }
}

export abstract class BigIntType extends NumericalType {
    constructor() {
        super("BigInt", 0, true);
    }
}

export class AddressType extends PrimitiveType {
    constructor() {
        super("Address");
    }

    canConvertTo(jsType: string): boolean {
        return jsType == "string" || jsType == "Address" || jsType == "Buffer";
    }
}

export class OptionalType extends Type {
    constructor() {
        super("Optional");
    }
}

export class VectorType extends Type {
    constructor() {
        super("Vector");
    }
}

export abstract class CustomType extends Type {
    // namespace?
    constructor(name: string) {
        super(name);
    }
}

export abstract class TypedValue {
    abstract getType(): Type;
}

export abstract class PrimitiveValue extends TypedValue {
    abstract getValue(): any;
    abstract convertTo(jsType: string): any;
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

/**
 * A numerical value fed to or fetched from a Smart Contract contract, as a strongly-typed, immutable abstraction.
 */
export class NumericalValue extends PrimitiveValue {
    readonly type: PrimitiveType;
    readonly value: bigint;
    readonly sizeInBytes: number | undefined;
    readonly withSign: boolean;

    constructor(value: bigint, type: NumericalType) {
        super();

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
        this.type.assertCanConvertTo("number");
        return Number(this.value);
    }

    getValue(): bigint {
        return this.asBigInt();
    }

    convertTo(jsType: string): any {
        this.type.assertCanConvertTo(jsType);

        if (jsType == "bigint") {
            return this.asBigInt();
        }
        if (jsType == "number") {
            return this.asNumber();
        }
    }

    getType(): Type {
        return this.type;
    }
}

/**
 * An address fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class AddressValue extends PrimitiveValue {
    private readonly type: AddressType = new AddressType();
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
        this.type.assertCanConvertTo(jsType);

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

    getType(): AddressType {
        return this.type;
    }
}

export class OptionalValue {
    private readonly value: any;

    constructor(value: any) {
        if (!(value instanceof TypedValue)) {
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

export function isTyped(value: any) {
    return onTypedValueSelect(value, {
        onPrimitive: () => true,
        onOptional: () => true,
        onVector: () => true,
        onCustom: () => true,
        onOther: () => false
    });
}

export function onPrimitiveValueSelect<TResult>(value: any, selectors: {
    onBoolean: () => TResult,
    onNumerical: () => TResult,
    onAddress: () => TResult,
    onOther: () => TResult
}): TResult {
    if (value instanceof BooleanValue) {
        return selectors.onBoolean();
    }
    if (value instanceof NumericalValue) {
        return selectors.onNumerical();
    }
    if (value instanceof AddressValue) {
        return selectors.onAddress();
    }

    return selectors.onOther();
}

export function onPrimitiveTypeSelect<TResult>(type: PrimitiveType, selectors: {
    onBoolean: () => TResult,
    onNumerical: () => TResult,
    onAddress: () => TResult,
    onOther: () => TResult
}): TResult {
    if (type instanceof BooleanType) {
        return selectors.onBoolean();
    }
    if (type instanceof NumericalType) {
        return selectors.onNumerical();
    }
    if (type instanceof AddressType) {
        return selectors.onAddress();
    }

    return selectors.onOther();
}

export function onTypedValueSelect<TResult>(value: any, selectors: {
    onPrimitive: () => TResult,
    onOptional: () => TResult,
    onVector: () => TResult,
    onCustom: () => TResult,
    onOther: () => TResult
}): TResult {
    if (value instanceof PrimitiveValue) {
        return selectors.onPrimitive();
    }
    if (value instanceof OptionalValue) {
        return selectors.onOptional();
    }
    if (value instanceof Vector) {
        return selectors.onVector();
    }

    // TODO: onCustom.

    return selectors.onOther();
}
