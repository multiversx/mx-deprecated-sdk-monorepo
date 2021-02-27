import { BytesValue } from "../typesystem/bytes";

export class BytesBinaryCodec {
    /**
     * Reads and decodes a Bytes object from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeNested(buffer: Buffer): [BytesValue, number] {
        let length = buffer.readUInt32BE();
        let payload = buffer.slice(4, 4 + length);
        let result = new BytesValue(payload);
        return [result, 4 + length];
    }

    /**
     * Reads and decodes a Bytes object from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer): BytesValue {
        return new BytesValue(buffer);
    }

    encodeNested(bytes: BytesValue): Buffer {
        let lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(bytes.getLength());
        let buffer = Buffer.concat([lengthBuffer, bytes.valueOf()]);
        return buffer;
    }

    encodeTopLevel(bytes: BytesValue): Buffer {
        return bytes.valueOf();
    }
}
