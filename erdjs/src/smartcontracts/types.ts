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

        let isNotNegative = !type.withSign || isMbsZero(payload, 0);
        if (isNotNegative) {
            let value = bufferToBigInt(payload);
            return new NumericalValue(value, type);
        }

        // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/twos2bigint.go
        flipBuffer(payload);
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

        // Nothing or Zero
        if (!this.value) {
            return Buffer.alloc(0);
        }

        if (withSign) {
            if (this.value > 0) {
                let hex = getHexMagnitudeOfBigInt(this.value);
                let buffer = Buffer.from(hex, "hex");

                // Fix ambiguity if any
                if (isMbsOne(buffer, 0)) {
                    buffer = Buffer.concat([Buffer.from([0x00]), buffer]);
                }

                return buffer;
            } else {
                // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/bigint2twos.go
                let valuePlusOne = this.value + BigInt(1);
                let hex = getHexMagnitudeOfBigInt(valuePlusOne);
                let buffer = Buffer.from(hex, "hex");
                flipBuffer(buffer);

                // Fix ambiguity if any
                if (isMbsZero(buffer, 0)) {
                    buffer = Buffer.concat([Buffer.from([0xFF]), buffer]);
                }

                return buffer;
            }
        } else {
            let hex = getHexMagnitudeOfBigInt(this.value);
            let buffer = Buffer.from(hex, "hex");
            return buffer;
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
}

export class OptionalValue implements IBoxedValue {
    private readonly value: IBoxedValue | undefined;

    constructor(value: IBoxedValue | undefined) {
        this.value = value;
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

export function getHexMagnitudeOfBigInt(value: bigint): string {
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

export function flipBuffer(buffer: Buffer) {
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] = ~buffer[i];
    }
}

export class Vector implements IBoxedValue {
    constructor() {
    }

    encodeBinaryNested(): Buffer {
        throw new Error("Method not implemented.");
    }

    encodeBinaryTopLevel(): Buffer {
        throw new Error("Method not implemented.");
    }
}

function cloneBuffer(buffer: Buffer) {
    let clone = Buffer.alloc(buffer.length);
    buffer.copy(clone);
    return clone;
}

function bufferToBigInt(buffer: Buffer): bigint {
    // Currently, in JavaScript, this is the feasible way to achieve reliable, arbitrary-size buffer to BigInt conversion.
    let hex = buffer.toString("hex");
    let value = BigInt(`0x${hex}`);
    return value;
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