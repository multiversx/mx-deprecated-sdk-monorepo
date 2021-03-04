import { Type, TypedValue, List } from "../typesystem";
import { BinaryCodec } from "./binary";

export class ListBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    /**
     * Reads and decodes a List from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeNested(buffer: Buffer, type: Type): [List, number] {
        let typeParameter = type.getFirstTypeParameter();
        let result: TypedValue[] = [];
        let numItems = buffer.readUInt32BE();
        this.parentCodec.constraints.checkListLength(numItems);

        let originalBuffer = buffer;
        let offset = 4;

        buffer = originalBuffer.slice(offset);

        for (let i = 0; i < numItems; i++) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, typeParameter);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }

        return [new List(type, result), offset];
    }

    /**
     * Reads and decodes a List from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer, type: Type): List {
        let typeParameter = type.getFirstTypeParameter();
        let result: TypedValue[] = [];

        let originalBuffer = buffer;
        let offset = 0;

        while (buffer.length > 0) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, typeParameter);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);

            this.parentCodec.constraints.checkListLength(result.length);
        }

        return new List(type, result);
    }

    encodeNested(list: List): Buffer {
        this.parentCodec.constraints.checkListLength(list.getLength());

        let lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(list.getLength());

        let itemsBuffers: Buffer[] = [];

        for (const item of list.getItems()) {
            let itemBuffer = this.parentCodec.encodeNested(item);
            itemsBuffers.push(itemBuffer);
        }

        let buffer = Buffer.concat([lengthBuffer, ...itemsBuffers]);
        return buffer;
    }

    encodeTopLevel(list: List): Buffer {
        this.parentCodec.constraints.checkListLength(list.getLength());

        let itemsBuffers: Buffer[] = [];

        for (const item of list.getItems()) {
            let itemBuffer = this.parentCodec.encodeNested(item);
            itemsBuffers.push(itemBuffer);
        }

        let buffer = Buffer.concat(itemsBuffers);
        return buffer;
    }
}
