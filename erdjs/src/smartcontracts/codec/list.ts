import { Type, TypedValue, List } from "../typesystem";
import { BinaryCodec } from "./binary";
import { SizeOfU32 } from "./constants";

/**
 * Encodes and decodes "List" objects
 * with respect to: {@link https://docs.elrond.com/developers/developer-reference/elrond-serialization-format/ | The Elrond Serialization Format}. 
 */
export class ListBinaryCodec {
    private readonly binaryCodec: BinaryCodec;

    constructor(binaryCodec: BinaryCodec) {
        this.binaryCodec = binaryCodec;
    }

    decodeNested(buffer: Buffer, type: Type): [List, number] {
        let typeParameter = type.getFirstTypeParameter();
        let result: TypedValue[] = [];
        let numItems = buffer.readUInt32BE();
        this.binaryCodec.constraints.checkListLength(numItems);

        let originalBuffer = buffer;
        let offset = SizeOfU32;

        buffer = originalBuffer.slice(offset);

        for (let i = 0; i < numItems; i++) {
            let [decoded, decodedLength] = this.binaryCodec.decodeNested(buffer, typeParameter);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }

        return [new List(type, result), offset];
    }

    decodeTopLevel(buffer: Buffer, type: Type): List {
        let typeParameter = type.getFirstTypeParameter();
        let result: TypedValue[] = [];

        let originalBuffer = buffer;
        let offset = 0;

        while (buffer.length > 0) {
            let [decoded, decodedLength] = this.binaryCodec.decodeNested(buffer, typeParameter);
            result.push(decoded);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);

            this.binaryCodec.constraints.checkListLength(result.length);
        }

        return new List(type, result);
    }

    encodeNested(list: List): Buffer {
        this.binaryCodec.constraints.checkListLength(list.getLength());

        let lengthBuffer = Buffer.alloc(SizeOfU32);
        lengthBuffer.writeUInt32BE(list.getLength());

        let itemsBuffers: Buffer[] = [];

        for (const item of list.getItems()) {
            let itemBuffer = this.binaryCodec.encodeNested(item);
            itemsBuffers.push(itemBuffer);
        }

        let buffer = Buffer.concat([lengthBuffer, ...itemsBuffers]);
        return buffer;
    }

    encodeTopLevel(list: List): Buffer {
        this.binaryCodec.constraints.checkListLength(list.getLength());

        let itemsBuffers: Buffer[] = [];

        for (const item of list.getItems()) {
            let itemBuffer = this.binaryCodec.encodeNested(item);
            itemsBuffers.push(itemBuffer);
        }

        let buffer = Buffer.concat(itemsBuffers);
        return buffer;
    }
}
