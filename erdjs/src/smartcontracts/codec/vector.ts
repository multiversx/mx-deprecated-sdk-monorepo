import { BetterType, TypedValue, Vector } from "../typesystem";
import { BinaryCodec } from "./binary";

export class VectorBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeNested(buffer: Buffer, type: BetterType): [Vector, number] {
        let result: TypedValue[] = [];
        let numItems = buffer.readUInt32BE();
        this.parentCodec.constraints.checkVectorLength(numItems);

        let originalBuffer = buffer;
        let offset = 4;

        buffer = originalBuffer.slice(offset);

        for (let i = 0; i < numItems; i++) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, type);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }

        return [new Vector(type, result), offset];
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer, type: BetterType): Vector {
        let result: TypedValue[] = [];

        let originalBuffer = buffer;
        let offset = 0;

        while (buffer.length > 0) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, type);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);

            this.parentCodec.constraints.checkVectorLength(result.length);
        }

        return new Vector(type, result);
    }

    encodeNested(vector: Vector): Buffer {
        this.parentCodec.constraints.checkVectorLength(vector.getLength());

        let lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(vector.getLength());

        let itemsBuffers: Buffer[] = [];

        for (const item of vector.getItems()) {
            let itemBuffer = this.parentCodec.encodeNested(item);
            itemsBuffers.push(itemBuffer);
        }

        let buffer = Buffer.concat([lengthBuffer, ...itemsBuffers]);
        return buffer;
    }

    encodeTopLevel(vector: Vector): Buffer {
        this.parentCodec.constraints.checkVectorLength(vector.getLength());

        let itemsBuffers: Buffer[] = [];

        for (const item of vector.getItems()) {
            let itemBuffer = this.parentCodec.encodeNested(item);
            itemsBuffers.push(itemBuffer);
        }

        let buffer = Buffer.concat(itemsBuffers);
        return buffer;
    }
}
