import { TypeDescriptor, TypedValue, Vector } from "../typesystem";
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
    decodeNested(buffer: Buffer, typeDescriptor: TypeDescriptor): [Vector, number] {
        let result: TypedValue[] = [];
        let numItems = buffer.readUInt32BE();
        
        let originalBuffer = buffer;
        let offset = 4;

        buffer = buffer.slice(offset);

        buffer = originalBuffer.slice(offset);

        for (let i = 0; i < numItems; i++) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, typeDescriptor);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }

        return [new Vector(result), offset];
    }

    /**
     * Reads and decodes a Vector from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer, typeDescriptor: TypeDescriptor): Vector {
        let result: TypedValue[] = [];

        let originalBuffer = buffer;
        let offset = 0;

        while (buffer.length > 0) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, typeDescriptor);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }

        return new Vector(result);
    }

    encodeNested(_: Vector): Buffer {
        throw new Error("Method not implemented.");
    }

    encodeTopLevel(_: Vector): Buffer {
        throw new Error("Method not implemented.");
    }
}
