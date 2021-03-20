import { StructType, Struct, StructField } from "../typesystem";
import { BinaryCodec } from "./binary";

export class StructBinaryCodec {
    private readonly binaryCodec: BinaryCodec;

    constructor(binaryCodec: BinaryCodec) {
        this.binaryCodec = binaryCodec;
    }

    decodeTopLevel(buffer: Buffer, type: StructType): Struct {
        let [decoded, length] = this.decodeNested(buffer, type);
        return decoded;
    }

    decodeNested(buffer: Buffer, type: StructType): [Struct, number] {
        let originalBuffer = buffer;
        let offset = 0;

        let fieldDefinitions = type.fields;
        let fields: StructField[] = [];

        for (const fieldDefinition of fieldDefinitions) {
            let [decoded, decodedLength] = this.binaryCodec.decodeNested(buffer, fieldDefinition.type);
            let field = new StructField(decoded, fieldDefinition.name);
            fields.push(field);
            offset += decodedLength;
            buffer = originalBuffer.slice(offset);
        }
        
        let struct = new Struct(type, fields);
        return [struct, offset];
    }

    encodeNested(struct: Struct): Buffer {
        let buffers: Buffer[] = [];
        let fields = struct.getFields();
        
        for (const field of fields) {
            let fieldBuffer = this.binaryCodec.encodeNested(field.value);
            buffers.push(fieldBuffer);
        }

        let buffer = Buffer.concat(buffers);
        return buffer;
    }

    encodeTopLevel(struct: Struct): Buffer {
        return this.encodeNested(struct);
    }
}
