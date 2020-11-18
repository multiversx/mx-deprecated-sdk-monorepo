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
    encodeBinary(nested: boolean): Buffer;
    // TODO: decodeBinary(nested: boolean, buffer: Buffer): <?>
}

export class IntegerValue implements IBoxedValue {
    private readonly sizeInBytes: number;
    private readonly withSign: boolean;
    private readonly value: number;

    private constructor(value: number, sizeInBytes: number, withSign: boolean) {
        this.sizeInBytes = sizeInBytes;
        this.withSign = withSign;
        this.value = value;
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
                throw new errors.ErrInvalidArgument("value", value);
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

    encodeBinary(nested: boolean): Buffer {
        const maxLength = 8;
        let buffer = Buffer.alloc(maxLength);

        if (this.withSign) {
            buffer.writeBigInt64BE(BigInt(this.value));
        } else {
            buffer.writeBigUInt64BE(BigInt(this.value));
        }

        if (nested) {
            // Cut to size.
            buffer = buffer.slice(buffer.length - this.sizeInBytes);
        } else {
            if (this.withSign) {
                buffer = discardSuperfluousBytesInTwosComplement(buffer);
            } else {
                buffer = discardSuperfluousZeroBytes(buffer);
            }
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

    static bigUInt(value: bigint): BigIntegerValue {
        return new BigIntegerValue(value, false);
    }

    static bigInt(value: bigint): BigIntegerValue {
        return new BigIntegerValue(value, true);
    }

    encodeBinary(_: boolean): Buffer {
        throw new Error("Method not implemented.");
    }
}

export class OptionalValue implements IBoxedValue {
    private readonly value: IBoxedValue | undefined;

    constructor(value: IBoxedValue | undefined) {
        this.value = value;
    }

    encodeBinary(nested: boolean): Buffer {
        if (this.value) {
            return Buffer.concat([Buffer.from([1]), this.value.encodeBinary(true)]);
        }

        return nested ? Buffer.from([0]) : Buffer.from([]);
    }
}

/**
 * Discards the leading bytes that are merely a padding of the leading sign bit (but keeps the payload).
 * @param buffer A number, represented as a sequence of bytes (big-endian)
 */
export function discardSuperfluousBytesInTwosComplement(buffer: Buffer): Buffer {
    let isNegative = isMostSignificantBitSet(buffer, 0);
    let signPadding: number = isNegative ? 0xFF : 0x00;

    let index;
    for (index = 0; index < buffer.length - 1; index++) {
        let isPaddingByte = buffer[index] == signPadding;
        let hasSignBitOnNextByte = isMostSignificantBitSet(buffer, index + 1) === isNegative;
        if (isPaddingByte && hasSignBitOnNextByte) {
            continue;
        }

        break;
    }

    return buffer.slice(index);
}


/**
 * Returns whether the most significant bit of a given byte (within a buffer) is set.
 * @param buffer the buffer to test
 * @param byteIndex the index of the byte to test
 */
export function isMostSignificantBitSet(buffer: Buffer, byteIndex: number = 0): boolean {
    let byte = buffer[byteIndex];
    let bit = byte >> 7;
    let isSet = bit % 2 == 1;
    return isSet;
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
