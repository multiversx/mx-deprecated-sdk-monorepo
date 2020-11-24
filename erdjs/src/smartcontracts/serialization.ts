import { Address } from "../address";
import { StructureDefinition } from "./abi";
import { decodeNested, PrimitiveType } from "./types";
import * as errors from "../errors";

export class BinarySerializer {
    deserialize(buffer: Buffer, into: any, structDefinition: StructureDefinition): any {
        let fields = structDefinition.getFields();
        let reader = new BinaryReader(buffer);

        fields.forEach(field => {
            into[field.name] = reader.readPrimitive(field.type, field.asArray);
        });
    }
}

export class BinaryReader {
    private readonly buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    readPrimitive(type: PrimitiveType, asArray: boolean): any {
        if (asArray) {
            return null;
        }

        let slice = this.buffer.slice(this.offset);
        let [decoded, decodedLength] = decodeNested(slice, type);
        this.incrementOffset(decodedLength);
        return decoded;
    }

    private incrementOffset(value: number) {
        this.offset += value;
    }
}