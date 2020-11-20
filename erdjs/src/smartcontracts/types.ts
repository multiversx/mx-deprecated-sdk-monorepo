import * as errors from "../errors";

export enum PrimitiveType {
    Boolean,
    U8,
    U16,
    U32,
    U64,
    I8,
    I16,
    I32,
    I64,
    BigUInt,
    BigInt,
    Address
}

export interface IBoxedValue {
    encodeBinaryNested(): Buffer;
    encodeBinaryTopLevel(): Buffer;
}

export class IntegerValue implements IBoxedValue {
    private readonly sizeInBytes: number;
    private readonly withSign: boolean;
    private readonly value: number;

    private constructor(value: number, sizeInBytes: number, withSign: boolean) {
        this.sizeInBytes = sizeInBytes;
        this.withSign = withSign;
        this.value = value;

        if (typeof (value) != "number") {
            throw new errors.ErrInvalidArgument("value", value);
        }
        if (!this.withSign && value < 0) {
            throw new errors.ErrInvalidArgument("value", value);
        }
    }

    static create(value: number, type: PrimitiveType): IntegerValue {
        switch (+type) {
            case PrimitiveType.U8:
                return IntegerValue.u8(value);
            case PrimitiveType.U16:
                return IntegerValue.u16(value);
            case PrimitiveType.U32:
                return IntegerValue.u32(value);
            case PrimitiveType.U64:
                return IntegerValue.u64(value);

            case PrimitiveType.I8:
                return IntegerValue.i8(value);
            case PrimitiveType.I16:
                return IntegerValue.i16(value);
            case PrimitiveType.I32:
                return IntegerValue.i32(value);
            case PrimitiveType.I64:
                return IntegerValue.i64(value);

            default:
                throw new errors.ErrInvalidArgument("type", type);
        }
    }

    static decodeNested(buffer: Buffer, type: PrimitiveType): IntegerValue {
        switch (+type) {
            case PrimitiveType.U8:
                return IntegerValue.u8(buffer.readUInt8());
            case PrimitiveType.U16:
                return IntegerValue.u16(buffer.readUInt16BE());
            case PrimitiveType.U32:
                return IntegerValue.u32(buffer.readUInt32BE());
            case PrimitiveType.U64:
                throw new Error("Not implemented.");

            case PrimitiveType.I8:
                return IntegerValue.i8(buffer.readInt8());
            case PrimitiveType.I16:
                return IntegerValue.i16(buffer.readInt16BE());
            case PrimitiveType.I32:
                return IntegerValue.i32(buffer.readInt32BE());
            case PrimitiveType.I64:
                throw new Error("Not implemented.");

            default:
                throw new errors.ErrInvalidArgument("type", type);
        }
    }

    static u8(value: number): IntegerValue {
        return new IntegerValue(value, 1, false);
    }

    static u16(value: number): IntegerValue {
        return new IntegerValue(value, 2, false);
    }

    static u32(value: number): IntegerValue {
        return new IntegerValue(value, 4, false);
    }

    static u64(value: number): IntegerValue {
        return new IntegerValue(value, 8, false);
    }

    static i8(value: number): IntegerValue {
        return new IntegerValue(value, 1, true);
    }

    static i16(value: number): IntegerValue {
        return new IntegerValue(value, 2, true);
    }

    static i32(value: number): IntegerValue {
        return new IntegerValue(value, 4, true);
    }

    static i64(value: number): IntegerValue {
        return new IntegerValue(value, 8, true);
    }

    encodeBinaryNested(): Buffer {
        const maxLength = 8;
        let buffer = Buffer.alloc(maxLength);

        if (this.withSign) {
            buffer.writeBigInt64BE(BigInt(this.value));
        } else {
            buffer.writeBigUInt64BE(BigInt(this.value));
        }

        // Cut to size.
        buffer = buffer.slice(buffer.length - this.sizeInBytes);
        return buffer;
    }

    encodeBinaryTopLevel(): Buffer {
        let buffer: Buffer = this.encodeBinaryNested();

        if (this.withSign) {
            buffer = discardSuperfluousBytesInTwosComplement(buffer);
        } else {
            buffer = discardSuperfluousZeroBytes(buffer);
        }

        return buffer;
    }
}

export class BigIntegerValue implements IBoxedValue {
    private readonly withSign: boolean;
    private readonly value: bigint;

    private constructor(value: bigint, withSign: boolean) {
        this.withSign = withSign;
        this.value = value;
    }

    static create(value: bigint, type: PrimitiveType): BigIntegerValue {
        switch (+type) {
            case PrimitiveType.BigUInt:
                return BigIntegerValue.bigUInt(value);
            case PrimitiveType.BigInt:
                return BigIntegerValue.bigInt(value);
            default:
                throw new errors.ErrInvalidArgument("value", value);
        }
    }

    static decodeNested(buffer: Buffer, type: PrimitiveType): BigIntegerValue {
        let length = buffer.readUInt32BE();
        let empty = length == 0;
        let payload = buffer.slice(4);

        if (type == PrimitiveType.BigUInt) {
            if (empty) {
                return BigIntegerValue.bigUInt(BigInt(0));
            }

            let hex = payload.toString("hex");
            let value = BigInt(`0x${hex}`);

            return BigIntegerValue.bigUInt(value);
        } else if (type == PrimitiveType.BigInt) {
            if (empty) {
                return BigIntegerValue.bigInt(BigInt(0));
            }

            if (isMbsZero(payload, 0)) {
                let hex = payload.toString("hex");
                let value = BigInt(`0x${hex}`);

                return BigIntegerValue.bigInt(value);
            } else {
                // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/twos2bigint.go
                flipBuffer(payload);
                let hex = payload.toString("hex");
                let value = BigInt(`0x${hex}`);
                let valueMinusOne = value - BigInt(1);

                return BigIntegerValue.bigInt(valueMinusOne);
            }
        } else {
            throw new errors.ErrInvalidArgument("type", type);
        }
    }

    static bigUInt(value: bigint): BigIntegerValue {
        return new BigIntegerValue(value, false);
    }

    static bigInt(value: bigint): BigIntegerValue {
        return new BigIntegerValue(value, true);
    }

    encodeBinaryNested(): Buffer {
        let buffer = this.encodeBinaryTopLevel();
        let length = Buffer.alloc(4);
        length.writeUInt32BE(buffer.length);
        return Buffer.concat([length, buffer]);
    }

    encodeBinaryTopLevel(): Buffer {
        // Nothing or Zero
        if (!this.value) {
            return Buffer.alloc(0);
        }

        if (this.withSign) {
            if (this.value > 0) {
                let hex = padHexString(this.value.toString(16));
                let buffer = Buffer.from(hex, "hex");

                // Fix ambiguity if any
                if (isMbsOne(buffer, 0)) {
                    buffer = Buffer.concat([Buffer.from([0x00]), buffer]);
                }

                return buffer;
            } else {
                // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/bigint2twos.go
                let valuePlusOne = this.value + BigInt(1);
                let hex = padHexString(valuePlusOne.toString(16));
                let buffer = Buffer.from(hex, "hex");
                flipBuffer(buffer);
                
                // Fix ambiguity if any
                if (isMbsZero(buffer, 0)) {
                    buffer = Buffer.concat([Buffer.from([0xFF]), buffer]);
                }

                return buffer;
            }
        } else {
            let hex = padHexString(this.value.toString(16));
            let buffer = Buffer.from(hex, "hex");
            return buffer;
        }
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

export function padHexString(str: string, padding: string = "0"): string {
    return str.length % 2 == 0 ? str : padding + str;
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
