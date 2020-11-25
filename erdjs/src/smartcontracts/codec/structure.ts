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
        let fieldDefinitions = type.definition.fields;
        let data: any = {};

        fieldDefinitions.forEach(field => {
            let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer, field.getTypeDescriptor());
            data[field.name] = decoded;

            // TODO: Fix. Wrong. Does not correctly advance the offset.
            // Use a Reader!
            buffer = buffer.slice(decodedLength);
        });
        
        let structure = new Structure(type, data);
        // TODO: Fix!
        return [structure, 42];
    }
}