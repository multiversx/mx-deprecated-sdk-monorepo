import { Address } from "../address";
import { AbiRegistry, StructureDefinition } from "./abi";
import { AddressValue, BooleanValue, IPrimitiveValue, NumericalValue, OptionalValue, PrimitiveType, Vector } from "./types";
import * as errors from "../errors";

export class BinaryCodec {
    private readonly abiRegistry: AbiRegistry;
    private readonly vectorCodec: VectorBinaryCodec;
    private readonly optionalCodec: OptionalValueBinaryCodec;
    private readonly booleanCodec: BooleanBinaryCodec;
    private readonly numericalCodec: NumericalBinaryCoded;
    private readonly addressCoded: AddressBinaryCodec;

    constructor(abiRegistry: AbiRegistry) {
        this.abiRegistry = abiRegistry;

        this.vectorCodec = new VectorBinaryCodec(this);
        this.optionalCodec = new OptionalValueBinaryCodec(this);
        this.booleanCodec = new BooleanBinaryCodec();
        this.numericalCodec = new NumericalBinaryCoded();
        this.addressCoded = new AddressBinaryCodec();
    }

    // decodeExecutionOutput()
    // decodeQueryOutput()
    // encodeFunctionInput()
    // decodeOutput() (generic output, ReturnData array)
    // encodeStructure()
    // decodeStructure()


    // decodeStructure(buffer: Buffer, into: any): any {
    //     let fields = structDefinition.getFields();
    //     let reader = new BinaryReader(buffer);

    //     fields.forEach(field => {
    //         into[field.name] = reader.readPrimitive(field.type, field.asArray);
    //     });
    // }

    encodeNested(_: any): Buffer {
        // if is primitive, get which one and switch to that codec.
        // if is vector, then...
        // if is convertible to...
        throw new Error("Method not implemented.");
    }

    encodeTopLevel(_: any): Buffer {
        throw new Error("Method not implemented.");
    }

    decodePrimitiveNested(buffer: Buffer, type: PrimitiveType): [IPrimitiveValue, number] {
        if (type.isNumeric) {
            return this.numericalCodec.decodeNested(buffer, type);
        }
        if (type == PrimitiveType.Boolean) {
            return this.booleanCodec.decodeNested(buffer);
        }
        if (type == PrimitiveType.Address) {
            return this.addressCoded.decodeNested(buffer);
        }

        throw new errors.ErrUnsupportedOperation("decodePrimitiveNested", `unknown type "${type}"`);
    }

    decodePrimitiveTopLevel(buffer: Buffer, type: PrimitiveType): IPrimitiveValue {
        if (type.isNumeric) {
            return this.numericalCodec.decodeTopLevel(buffer, type);
        }
        if (type == PrimitiveType.Boolean) {
            return this.booleanCodec.decodeTopLevel(buffer);
        }
        if (type == PrimitiveType.Address) {
            return this.addressCoded.decodeTopLevel(buffer);
        }

        throw new errors.ErrUnsupportedOperation("decodePrimitiveTopLevel", `unknown type "${type}"`);
    }
}

class VectorBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    decodeVectorNested(buffer: Buffer, type: PrimitiveType): Vector {
        let result: any[] = [];
        let numItems = buffer.readUInt32BE();

        for (let i = 0; i < numItems; i++) {
            let [decoded, decodedLength] = this.parentCodec.decodePrimitiveNested(buffer, type);
            buffer = buffer.slice(decodedLength);
            result.push(decoded);
        }

        return new Vector(result);
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    decodeVectorTopLevel(buffer: Buffer, type: PrimitiveType): Vector {
        let result: any[] = [];

        while (buffer.length > 0) {
            let [decoded, decodedLength] = this.parentCodec.decodePrimitiveNested(buffer, type);
            buffer = buffer.slice(decodedLength);
            result.push(decoded);
        }

        return new Vector(result);
    }

    encodeBinaryNested(_: Vector): Buffer {
        throw new Error("Method not implemented.");
    }

    encodeBinaryTopLevel(_: Vector): Buffer {
        throw new Error("Method not implemented.");
    }
}

class OptionalValueBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    decodeNested(_: Buffer): OptionalValue {
        throw new Error("Method not implemented.");
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    decodeTopLevel(_: Buffer): OptionalValue {
        throw new Error("Method not implemented.");
    }

    encodeBinaryNested(optionalValue: OptionalValue): Buffer {
        if (optionalValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.parentCodec.encodeNested(optionalValue)]);
        }

        return Buffer.from([0]);
    }

    encodeBinaryTopLevel(optionalValue: OptionalValue): Buffer {
        if (optionalValue.isSet()) {
            return this.parentCodec.encodeNested(optionalValue);
        }

        return Buffer.from([]);
    }
}

class BooleanBinaryCodec {
    private static readonly TRUE: number = 0x01;
    private static readonly FALSE: number = 0x00;

    /**
    * Reads and decodes a BooleanValue from a given buffer, 
    * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
    * 
    * @param buffer the input buffer
    */
    decodeNested(buffer: Buffer): [BooleanValue, number] {
        // We don't not check the size of the buffer, we just read the first byte.

        let byte = buffer.readUInt8();
        return [new BooleanValue(byte == BooleanBinaryCodec.TRUE), 1];
    }

    /**
     * Reads and decodes a BooleanValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    decodeTopLevel(buffer: Buffer): BooleanValue {
        if (buffer.length > 1) {
            throw new errors.ErrInvalidArgument("buffer", buffer, "should be a buffer of size <= 1");
        }

        let firstByte = buffer[0];
        return new BooleanValue(firstByte == BooleanBinaryCodec.TRUE);
    }

    /**
     * Encodes a BooleanValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryNested(primitive: BooleanValue): Buffer {
        if (primitive.isTrue()) {
            return Buffer.from([BooleanBinaryCodec.TRUE]);
        }

        return Buffer.from([BooleanBinaryCodec.FALSE]);
    }

    /**
     * Encodes a BooleanValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryTopLevel(primitive: BooleanValue): Buffer {
        if (primitive.isTrue()) {
            return Buffer.from([BooleanBinaryCodec.TRUE]);
        }

        return Buffer.from([]);
    }
}

class NumericalBinaryCoded {
    /**
     * Reads and decodes a NumericalValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     * @param type the primitive type
     */
    decodeNested(buffer: Buffer, type: PrimitiveType): [NumericalValue, number] {
        let offset = 0;
        let length = type.sizeInBytes;

        if (!length) {
            // Size of type is not known: arbitrary-size big integer.
            // Therefore, we must read the length from the header.
            offset = 4;
            length = buffer.readUInt32BE();
        }

        let payload = buffer.slice(offset, offset + length);
        let result = this.decodeTopLevel(payload, type);
        let decodedLength = length + offset;
        return [result, decodedLength];
    }

    /**
     * Reads and decodes a NumericalValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     * @param type the primitive type
     */
    decodeTopLevel(buffer: Buffer, type: PrimitiveType): NumericalValue {
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
    encodeBinaryNested(primitive: NumericalValue): Buffer {
        if (primitive.sizeInBytes) {
            // Size is known: fixed-size integer. For simplicity, we will alloc a 64 bit buffer, write using "writeBig(*)Int64BE",
            // then cut the buffer to the desired size
            let buffer = Buffer.alloc(8);
            if (primitive.withSign) {
                buffer.writeBigInt64BE(BigInt(primitive.value));
            } else {
                buffer.writeBigUInt64BE(BigInt(primitive.value));
            }

            // Cut to size.
            buffer = buffer.slice(buffer.length - primitive.sizeInBytes);
            return buffer;
        }

        // Size is not known: arbitrary-size big integer. Therefore, we must emit the length (as U32) before the actual payload.
        let buffer = this.encodeBinaryTopLevel(primitive);
        let length = Buffer.alloc(4);
        length.writeUInt32BE(buffer.length);
        return Buffer.concat([length, buffer]);
    }

    /**
     * Encodes a NumericalValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeBinaryTopLevel(primitive: NumericalValue): Buffer {
        let withSign = primitive.withSign;

        // Nothing or Zero:
        if (!primitive.value) {
            return Buffer.alloc(0);
        }

        // I don't care about the sign:
        if (!withSign) {
            let buffer = bigIntToBuffer(primitive.value);
            return buffer;
        }

        // Positive:
        if (primitive.value > 0) {
            let buffer = bigIntToBuffer(primitive.value);

            // Fix ambiguity if any
            if (isMbsOne(buffer)) {
                buffer = prependByteToBuffer(buffer, 0x00);
            }

            return buffer;
        }

        // Negative:
        // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/bigint2twos.go
        let valuePlusOne = primitive.value + BigInt(1);
        let buffer = bigIntToBuffer(valuePlusOne);
        flipBufferBitsInPlace(buffer);

        // Fix ambiguity if any
        if (isMbsZero(buffer)) {
            buffer = prependByteToBuffer(buffer, 0xFF);
        }

        return buffer;
    }
}

class AddressBinaryCodec {
    /**
     * Reads and decodes an AddressValue from a given buffer.
     * 
     * @param buffer the input buffer
     */
    decodeNested(buffer: Buffer): [AddressValue, number] {
        // We don't not check the size of the buffer, we just read 32 bytes.

        let slice = buffer.slice(0, 32);
        let value = new Address(slice);
        return [new AddressValue(value), 32];
    }

    /**
     * Reads and decodes an AddressValue from a given buffer.
     * 
     * @param buffer the input buffer
     */
    decodeTopLevel(buffer: Buffer): AddressValue {
        let [decoded, length] = this.decodeNested(buffer);
        return decoded;
    }

    /**
     * Encodes an AddressValue to a buffer.
     */
    encodeBinaryNested(primitive: AddressValue): Buffer {
        return primitive.getValue().pubkey();
    }

    /**
     * Encodes an AddressValue to a buffer.
     */
    encodeBinaryTopLevel(primitive: AddressValue): Buffer {
        return primitive.getValue().pubkey();
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
