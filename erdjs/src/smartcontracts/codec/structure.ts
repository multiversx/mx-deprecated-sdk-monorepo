import { StructureType, Structure } from "../typesystem";
import { BinaryCodec } from "./binary";

export class StructureBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    decodeTopLevel(buffer: Buffer, type: StructureType): Structure {
        let [decoded, length] = this.decodeNested(buffer, type);
        return decoded;
    }

    decodeNested(buffer: Buffer, type: StructureType): [Structure, number] {
        let originalBuffer = buffer;
        let offset = 0;

        let fieldDefinitions = type.definition.fields;
        let data: any = {};

        for (const field of fieldDefinitions) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, field.getTypeDescriptor());
            data[field.name] = decoded;
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }
        
        let structure = new Structure(type, data);
        return [structure, offset];
    }
}