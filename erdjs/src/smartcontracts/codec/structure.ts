import { StructureType, Structure, StructureField } from "../typesystem";
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
        let fields: StructureField[] = [];

        for (const fieldDefinition of fieldDefinitions) {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, fieldDefinition.getTypeDescriptor());
            let field = new StructureField(decoded, fieldDefinition.name);
            fields.push(field);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }
        
        let structure = new Structure(type, fields);
        return [structure, offset];
    }

    encodeNested(structure: Structure): Buffer {
        let buffers: Buffer[] = [];
        let fields = structure.getFields();
        
        for (const field of fields) {
            let fieldBuffer = this.parentCodec.encodeNested(field.value);
            buffers.push(fieldBuffer);
        }

        let buffer = Buffer.concat(buffers);
        return buffer;
    }

    encodeTopLevel(structure: Structure): Buffer {
        return this.encodeNested(structure);
    }
}
