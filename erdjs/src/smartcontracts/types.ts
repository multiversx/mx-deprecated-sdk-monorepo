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
}

export interface IBoxedValue {
    encodeBinaryNested(): Buffer;
    encodeBinaryTopLevel(): Buffer;
}

/**
 * A boolean value fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class BooleanValue implements IBoxedValue {
    private static readonly TRUE: number = 0x01;
    private static readonly FALSE: number = 0x00;

    private readonly value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    /**
    * Reads and decodes a BooleanValue from a given buffer, 
    * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
    * 
    * @param buffer the input buffer
    */
    static decodeNested(buffer: Buffer): BooleanValue {
        // We don't not check the size of the buffer, we just read the first byte.

        let byte = buffer.readUInt8();
        return new BooleanValue(byte == BooleanValue.TRUE);
    }

    /**
     * Reads and decodes a BooleanValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    static decodeTopLevel(buffer: Buffer): BooleanValue {
        if (buffer.length > 1) {
            throw new errors.ErrInvalidArgument("buffer", buffer, "should be a buffer of size <= 1");
        }

        let firstByte = buffer[0];
        return new BooleanValue(firstByte == BooleanValue.TRUE);
    }

    /**
     * Encodes a BooleanValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryNested(): Buffer {
        if (this.value) {
            return Buffer.from([BooleanValue.TRUE]);
        }

        return Buffer.from([BooleanValue.FALSE]);
    }

    /**
     * Encodes a BooleanValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryTopLevel(): Buffer {
        if (this.value) {
            return Buffer.from([BooleanValue.TRUE]);
        }

        return Buffer.from([]);
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
}

/**
 * A numerical value fed to or fetched from a Smart Contract contract, as a strongly-typed, immutable abstraction.
 */
export class NumericalValue implements IBoxedValue {
    private readonly value: bigint;
    private readonly type: PrimitiveType;
    private readonly sizeInBytes: number | undefined;
    private readonly withSign: boolean;

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
     * Reads and decodes a NumericalValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     * @param type the primitive type
     */
    static decodeNested(buffer: Buffer, type: PrimitiveType): NumericalValue {
        let offset = 0;
        let length = type.sizeInBytes;

        if (!length) {
            // Size of type is not known: arbitrary-size big integer.
            // Therefore, we must read the length from the header.
            length = buffer.readUInt32BE();
            offset = 4;
        }

        let payload = buffer.slice(offset, offset + length);
        let result = this.decodeTopLevel(payload, type);
        return result;
    }

    /**
     * Reads and decodes a NumericalValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     * @param type the primitive type
     */
    static decodeTopLevel(buffer: Buffer, type: PrimitiveType): NumericalValue {
        let payload = cloneBuffer(buffer);

        let empty = buffer.length == 0;
        if (empty) {
            return new NumericalValue(BigInt(0), type);
        }

        let isNotNegative = !type.withSign || isMbsZero(payload);
        if (isNotNegative) {
            let value = bufferToBigInt(payload);
            return new NumericalValue(value, type);
        }

        // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/twos2bigint.go
        flipBufferBitsInPlace(payload);
        let value = bufferToBigInt(payload);
        let negativeValue = value * BigInt(-1);
        let negativeValueMinusOne = negativeValue - BigInt(1);

        return new NumericalValue(negativeValueMinusOne, type);
    }

    /**
     * Encodes a NumericalValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryNested(): Buffer {
        if (this.sizeInBytes) {
            // Size is known: fixed-size integer. For simplicity, we will alloc a 64 bit buffer, write using "writeBig(*)Int64BE",
            // then cut the buffer to the desired size
            let buffer = Buffer.alloc(8);
            if (this.withSign) {
                buffer.writeBigInt64BE(BigInt(this.value));
            } else {
                buffer.writeBigUInt64BE(BigInt(this.value));
            }

            // Cut to size.
            buffer = buffer.slice(buffer.length - this.sizeInBytes);
            return buffer;
        }

        // Size is not known: arbitrary-size big integer. Therefore, we must emit the length (as U32) before the actual payload.
        let buffer = this.encodeBinaryTopLevel();
        let length = Buffer.alloc(4);
        length.writeUInt32BE(buffer.length);
        return Buffer.concat([length, buffer]);
    }

    /**
     * Encodes a NumericalValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryTopLevel(): Buffer {
        let withSign = this.withSign;

        // Nothing or Zero:
        if (!this.value) {
            return Buffer.alloc(0);
        }

        // I don't care about the sign:
        if (!withSign) {
            let buffer = bigIntToBuffer(this.value);
            return buffer;
        }

        // Positive:
        if (this.value > 0) {
            let buffer = bigIntToBuffer(this.value);

            // Fix ambiguity if any
            if (isMbsOne(buffer)) {
                buffer = prependByteToBuffer(buffer, 0x00);
            }

            return buffer;
        }

        // Negative:
        // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/bigint2twos.go
        let valuePlusOne = this.value + BigInt(1);
        let buffer = bigIntToBuffer(valuePlusOne);
        flipBufferBitsInPlace(buffer);

        // Fix ambiguity if any
        if (isMbsZero(buffer)) {
            buffer = prependByteToBuffer(buffer, 0xFF);
        }

        return buffer;
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
}


/**
 * An address fed to or fetched from a Smart Contract contract, as an immutable abstraction.
 */
export class AddressValue implements IBoxedValue {
    private readonly value: Address;

    constructor(value: Address) {
        this.value = value;
    }

    /**
     * Reads and decodes an AddressValue from a given buffer.
     * 
     * @param buffer the input buffer
     */
    static decodeNested(buffer: Buffer): AddressValue {
        // We don't not check the size of the buffer, we just read 32 bytes.

        let slice = buffer.slice(0, 32);
        let value = new Address(slice);
        return new AddressValue(value);
    }

    /**
     * Reads and decodes an AddressValue from a given buffer.
     * 
     * @param buffer the input buffer
     */
    static decodeTopLevel(buffer: Buffer): AddressValue {
        return AddressValue.decodeNested(buffer);
    }

    /**
     * Encodes an AddressValue to a buffer.
     */
    encodeBinaryNested(): Buffer {
        return this.value.pubkey();
    }

    /**
     * Encodes an AddressValue to a buffer.
     */
    encodeBinaryTopLevel(): Buffer {
        return this.value.pubkey();
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
}

export class OptionalValue implements IBoxedValue {
    private readonly value: IBoxedValue | undefined;

    constructor(value: IBoxedValue | undefined) {
        this.value = value;
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    static decodeNested(_: Buffer): OptionalValue {
        throw new Error("Method not implemented.");
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    static decodeTopLevel(_: Buffer): OptionalValue {
        throw new Error("Method not implemented.");
    }

    encodeBinaryNested(): Buffer {
        if (this.value) {
            return Buffer.concat([Buffer.from([1]), this.value.encodeBinaryNested()]);
        }

        return Buffer.from([0]);
    }

    encodeBinaryTopLevel(): Buffer {
        if (this.value) {
            return this.encodeBinaryNested();
        }

        return Buffer.from([]);
    }
}

export class Vector implements IBoxedValue {
    constructor() {
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    static decodeNested(_: Buffer): Vector {
        throw new Error("Not implemented");
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    static decodeTopLevel(_: Buffer): Vector {
        throw new Error("Not implemented");
    }

    encodeBinaryNested(): Buffer {
        throw new Error("Method not implemented.");
    }

    encodeBinaryTopLevel(): Buffer {
        throw new Error("Method not implemented.");
    }
}

/**
 * Returns whether the most significant bit of a given byte (within a buffer) is 1.
 * @param buffer the buffer to test
 * @param byteIndex the index of the byte to test
 */
export function isMbsOne(buffer: Buffer, byteIndex: number = 0): boolean {
    let byte = buffer[byteIndex];
    let bit = byte >> 7;
    let isSet = bit % 2 == 1;
    return isSet;
}

/**
 * Returns whether the most significant bit of a given byte (within a buffer) is 0.
 * @param buffer the buffer to test
 * @param byteIndex the index of the byte to test
 */
export function isMbsZero(buffer: Buffer, byteIndex: number = 0): boolean {
    return !isMbsOne(buffer, byteIndex);
}

function cloneBuffer(buffer: Buffer) {
    let clone = Buffer.alloc(buffer.length);
    buffer.copy(clone);
    return clone;
}

function bufferToBigInt(buffer: Buffer): bigint {
    // Currently, in JavaScript, this is the feasible way to achieve reliable, arbitrary-size Buffer to BigInt conversion.
    let hex = buffer.toString("hex");
    let value = BigInt(`0x${hex}`);
    return value;
}

function bigIntToBuffer(value: bigint): Buffer {
    // Currently, in JavaScript, this is the feasible way to achieve reliable, arbitrary-size BigInt to Buffer conversion.
    let hex = getHexMagnitudeOfBigInt(value);
    let buffer = Buffer.from(hex, "hex");
    return buffer;
}

function getHexMagnitudeOfBigInt(value: bigint): string {
    if (!value) {
        return "";
    }

    if (value < BigInt(0)) {
        value = value * BigInt(-1);
    }

    let hex = value.toString(16);
    let padding = "0";

    if (hex.length % 2 == 1) {
        hex = padding + hex;
    }

    return hex;
}

function flipBufferBitsInPlace(buffer: Buffer) {
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] = ~buffer[i];
    }
}

function prependByteToBuffer(buffer: Buffer, byte: number) {
    return Buffer.concat([Buffer.from([byte]), buffer]);
}

/**
 * Discards the leading bytes that are merely a padding of the leading sign bit (but keeps the payload).
 * @param buffer A number, represented as a sequence of bytes (big-endian)
 */
export function discardSuperfluousBytesInTwosComplement(buffer: Buffer): Buffer {
    let isNegative = isMbsOne(buffer, 0);
    let signPadding: number = isNegative ? 0xFF : 0x00;

    let index;
    for (index = 0; index < buffer.length - 1; index++) {
        let isPaddingByte = buffer[index] == signPadding;
        let hasSignBitOnNextByte = isMbsOne(buffer, index + 1) === isNegative;
        if (isPaddingByte && hasSignBitOnNextByte) {
            continue;
        }

        break;
    }

    return buffer.slice(index);
}

/**
 * Discards the leading zero bytes.
 * @param buffer A number, represented as a sequence of bytes (big-endian)
 */
export function discardSuperfluousZeroBytes(buffer: Buffer): Buffer {
    let index;
    for (index = 0; index < buffer.length && buffer[index] == 0; index++) {
    }

    return buffer.slice(index);
}