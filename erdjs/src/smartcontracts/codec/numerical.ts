import { NumericalType, NumericalValue } from "../typesystem";
import { isMsbZero, isMsbOne, bigIntToBuffer, bufferToBigInt, cloneBuffer, flipBufferBitsInPlace, prependByteToBuffer } from "./utils";
import BigNumber from "bignumber.js";

export class NumericalBinaryCodec {
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
            return new NumericalValue(new BigNumber(0), type);
        }

        let isPositive = !type.withSign || isMsbZero(payload);
        if (isPositive) {
            let value = bufferToBigInt(payload);
            return new NumericalValue(value, type);
        }

        // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/twos2bigint.go
        flipBufferBitsInPlace(payload);
        let value = bufferToBigInt(payload);
        let negativeValue = value.multipliedBy(new BigNumber(-1));
        let negativeValueMinusOne = negativeValue.minus(new BigNumber(1));

        return new NumericalValue(negativeValueMinusOne, type);
    }

    /**
     * Encodes a NumericalValue to a buffer, 
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    encodeNested(primitive: NumericalValue): Buffer {


        if (primitive.sizeInBytes) {
            let withSign = primitive.withSign;

            // Nothing or Zero:
            if (primitive.value.isZero()) {
                return Buffer.alloc(primitive.sizeInBytes, 0x00);
            }

            // I don't care about the sign:
            if (!withSign) {
                const  buffer = bigIntToBuffer(primitive.value);
                const paddingBytes = Buffer.alloc(primitive.sizeInBytes - buffer.length, 0x00);
                return Buffer.concat([paddingBytes, buffer]);
            }

            if (primitive.value.isPositive()) {
                let buffer = bigIntToBuffer(primitive.value);

                // Fix ambiguity if any
                if (isMsbOne(buffer)) {
                    buffer = prependByteToBuffer(buffer, 0x00);
                }

                const paddingBytes = Buffer.alloc(primitive.sizeInBytes - buffer.length, 0x00);
                return Buffer.concat([paddingBytes, buffer]);
            }

            // Negative:
            // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/bigint2twos.go
            let valuePlusOne = primitive.value.plus(new BigNumber(1));
            let buffer = bigIntToBuffer(valuePlusOne);
            flipBufferBitsInPlace(buffer);

            // Fix ambiguity if any
            if (isMsbZero(buffer)) {
                buffer = prependByteToBuffer(buffer, 0xFF);
            }

            const paddingBytes = Buffer.alloc(primitive.sizeInBytes - buffer.length, 0xff);
            return Buffer.concat([paddingBytes, buffer]);
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
        if (primitive.value.isZero()) {
            return Buffer.alloc(0);
        }

        // I don't care about the sign:
        if (!withSign) {
            return bigIntToBuffer(primitive.value);
        }

        return this.encodePrimitive(primitive);
    }

    /**
     * Encodes a NumericalValue to a buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}.
     */
    encodePrimitive(primitive: NumericalValue): Buffer {
        // Positive:
        if (primitive.value.isPositive()) {
            let buffer = bigIntToBuffer(primitive.value);

            // Fix ambiguity if any
            if (isMsbOne(buffer)) {
                buffer = prependByteToBuffer(buffer, 0x00);
            }

            return buffer;
        }

        // Negative:
        // Also see: https://github.com/ElrondNetwork/big-int-util/blob/master/twos-complement/bigint2twos.go
        let valuePlusOne = primitive.value.plus(new BigNumber(1));
        let buffer = bigIntToBuffer(valuePlusOne);
        flipBufferBitsInPlace(buffer);

        // Fix ambiguity if any
        if (isMsbZero(buffer)) {
            buffer = prependByteToBuffer(buffer, 0xFF);
        }

        return buffer;
    }
}
