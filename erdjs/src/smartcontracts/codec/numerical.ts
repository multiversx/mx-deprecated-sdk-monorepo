import { NumericalType, NumericalValue } from "../typesystem";
import { isMsbZero, isMsbOne, bigIntToBuffer, bufferToBigInt, cloneBuffer, flipBufferBitsInPlace, prependByteToBuffer } from "./utils";

export class NumericalBinaryCoded {
    /**
     * Reads and decodes a NumericalValue from a given buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     * @param type the primitive type
     */
    decodeNested(buffer: Buffer, type: NumericalType): [NumericalValue, number] {
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
    decodeTopLevel(buffer: Buffer, type: NumericalType): NumericalValue {
        let payload = cloneBuffer(buffer);

        let empty = buffer.length == 0;
        if (empty) {
            return new NumericalValue(BigInt(0), type);
        }

        let isNotNegative = !type.withSign || isMsbZero(payload);
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
    encodeNested(primitive: NumericalValue): Buffer {
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
        let buffer = this.encodeTopLevel(primitive);
        let length = Buffer.alloc(4);
        length.writeUInt32BE(buffer.length);
        return Buffer.concat([length, buffer]);
    }

    /**
     * Encodes a NumericalValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeTopLevel(primitive: NumericalValue): Buffer {
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
            if (isMsbOne(buffer)) {
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
        if (isMsbZero(buffer)) {
            buffer = prependByteToBuffer(buffer, 0xFF);
        }

        return buffer;
    }
}
