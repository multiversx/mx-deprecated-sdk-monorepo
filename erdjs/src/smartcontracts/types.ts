import { strict } from "assert";
import * as errors from "../errors";

/**
 * Smart enum pattern for primitive types.
 */
export class PrimitiveType {
    readonly name: string;
    readonly sizeInBytes: number | undefined;
    readonly withSign: boolean;
    readonly canCastToNumber: boolean;

    static Boolean = new PrimitiveType("Boolean", 1, false, false);
    static U8 = new PrimitiveType("U8", 1, false, true);
    static U16 = new PrimitiveType("U16", 2, false, true);
    static U32 = new PrimitiveType("U32", 4, false, true);
    static U64 = new PrimitiveType("U64", 8, false, false);
    static I8 = new PrimitiveType("I8", 1, true, true);
    static I16 = new PrimitiveType("I16", 2, true, true);
    static I32 = new PrimitiveType("I32", 4, true, true);
    static I64 = new PrimitiveType("I64", 8, true, false);
    static BigUInt = new PrimitiveType("BigUInt", undefined, false, false,);
    static BigInt = new PrimitiveType("BigInt", undefined, true, false);
    static Address = new PrimitiveType("Address", 32, false, false);

    constructor(name: string, size: number | undefined, withSign: boolean, safeAsNumber: boolean) {
        this.name = name;
        this.sizeInBytes = size;
        this.withSign = withSign;
        this.canCastToNumber = safeAsNumber;
    }
}

export interface IBoxedValue {
    encodeBinaryNested(): Buffer;
    encodeBinaryTopLevel(): Buffer;
}

export class IntegerValue implements IBoxedValue {
    private readonly value: number;
    private readonly type: PrimitiveType;
    private readonly withSign: boolean;

    private constructor(value: number, type: PrimitiveType) {
        this.value = value;
        this.type = type;
        this.withSign = type.withSign;

        if (typeof (value) != "number") {
            throw new errors.ErrInvalidArgument("value", value);
        }
        if (!this.withSign && value < 0) {
            throw new errors.ErrInvalidArgument("value", value);
        }
    }

    static create(value: number, type: PrimitiveType): IntegerValue {
        return new IntegerValue(value, type);
    }

    static decodeNested(buffer: Buffer, type: PrimitiveType): IntegerValue {
        let bigValue = BigIntegerValue.decodeNested(buffer, type);
        let number = bigValue.asNumber();
        return new IntegerValue(number, type);
    }

    encodeBinaryNested(): Buffer {
        let big = BigInt(this.value);
        let bigValue = new BigIntegerValue(big, this.type);
        return bigValue.encodeBinaryNested();
    }

    encodeBinaryTopLevel(): Buffer {
        let big = BigInt(this.value);
        let bigValue = new BigIntegerValue(big, this.type);
        return bigValue.encodeBinaryTopLevel();
    }
}

export class BigIntegerValue implements IBoxedValue {
    private readonly value: bigint;
    private readonly type: PrimitiveType;
    private readonly sizeInBytes: number | undefined;
    private readonly withSign: boolean;

    constructor(value: bigint, type: PrimitiveType) {
        this.value = value;
        this.type = type;
        this.sizeInBytes = type.sizeInBytes;
        this.withSign = type.withSign;
    }

    static decodeNested(buffer: Buffer, type: PrimitiveType): BigIntegerValue {
        let sizeInBytes = type.sizeInBytes;
        let payload: Buffer;

        if (sizeInBytes) {
            // Size is known: fixed-size integer.
            payload = Buffer.alloc(sizeInBytes);
            buffer.copy(payload);
        } else {
            // Size is not known: arbitrary-size big integer.
            // Therefore, we must read the length from the header.

            let length = buffer.readUInt32BE();
            payload = Buffer.alloc(length);
            // Copy, but skip header.
            buffer.copy(payload, 0, 4);
        }

        let result = this.decodeTopLevel(payload, type);
        return result;
    }

    static decodeTopLevel(buffer: Buffer, type: PrimitiveType): BigIntegerValue {
        let withSign = type.withSign;
        let empty = buffer.length == 0;
        let payload = Buffer.alloc(buffer.length);
        buffer.copy(payload);

        if (!withSign) {
            if (empty) {
                return new BigIntegerValue(BigInt(0), type);
            }

            let hex = payload.toString("hex");
            let value = BigInt(`0x${hex}`);

            return new BigIntegerValue(value, type);
        } else {
            if (empty) {
                return new BigIntegerValue(BigInt(0), type);
            }

            if (isMbsZero(payload, 0)) {
                let hex = payload.toString("hex");
                let value = BigInt(`0x${hex}`);

                return new BigIntegerValue(value, type);
            } else {
                // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/twos2bigint.go
                flipBuffer(payload);
                let hex = payload.toString("hex");
                let value = BigInt(`0x${hex}`);
                let negativeValue = value * BigInt(-1);
                let negativeValueMinusOne = negativeValue - BigInt(1);

                return new BigIntegerValue(negativeValueMinusOne, type);
            }
        }
    }

    encodeBinaryNested(): Buffer {
        if (this.sizeInBytes) {
            // Size is known: fixed-size integer. For simplicity (and efficiency), we will alloc a 64 bit buffer, write using "writeBig(*)Int64BE",
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

    equals(other: BigIntegerValue): boolean {
        return this.value == other.value;
    }

    asBigInt(): bigint {
        return this.value;
    }

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
