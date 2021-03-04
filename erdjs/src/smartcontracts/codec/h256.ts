import { H256Value } from "../typesystem/h256";

export class H256BinaryCodec {
    /**
     * Reads and decodes a H256Value from a given buffer.
     * 
     * @param buffer the input buffer
     */
    decodeNested(buffer: Buffer): [H256Value, number] {
        // We don't check the size of the buffer, we just read 32 bytes.
        let slice = buffer.slice(0, 32);
        return [new H256Value(slice), 32];
    }

    /**
     * Reads and decodes a H256Value from a given buffer.
     * 
     * @param buffer the input buffer
     */
    decodeTopLevel(buffer: Buffer): H256Value {
        let [decoded, length] = this.decodeNested(buffer);
        return decoded;
    }

    /**
     * Encodes a H256Value to a buffer.
     */
    encodeNested(primitive: H256Value): Buffer {
        return primitive.valueOf();
    }

    /**
     * Encodes a H256Value to a buffer.
     */
    encodeTopLevel(primitive: H256Value): Buffer {
        return primitive.valueOf();
    }
}
