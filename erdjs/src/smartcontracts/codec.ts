import { Address } from "../address";
import { AbiRegistry, StructureDefinition } from "./abi";
import { decodeNested, PrimitiveType } from "./types";
import * as errors from "../errors";

export class Codec {
    private readonly abiRegistry: AbiRegistry;

    constructor(abiRegistry: AbiRegistry) {
        this.abiRegistry = abiRegistry;
    }

    deserialize(buffer: Buffer, into: any, structDefinition: StructureDefinition): any {
        let fields = structDefinition.getFields();
        let reader = new BinaryReader(buffer);

        fields.forEach(field => {
            into[field.name] = reader.readPrimitive(field.type, field.asArray);
        });
    }
}



// export function decodeNested(buffer: Buffer, type: PrimitiveType): [IBoxedValue, number] {
//     if (type.isNumeric) {
//         return NumericalValue.decodeNested(buffer, type);
//     }
//     if (type == PrimitiveType.Boolean) {
//         return BooleanValue.decodeNested(buffer);
//     }
//     if (type == PrimitiveType.Address) {
//         return AddressValue.decodeNested(buffer);
//     }

//     // TODO: For user-defined types, call decode.
//     throw new errors.ErrUnsupportedOperation("decodeNested", `unknown type "${type}"`);
// }

// export function decodeTopLevel(buffer: Buffer, type: PrimitiveType): IBoxedValue {
//     if (type.isNumeric) {
//         return NumericalValue.decodeTopLevel(buffer, type);
//     }
//     if (type == PrimitiveType.Boolean) {
//         return BooleanValue.decodeTopLevel(buffer);
//     }
//     if (type == PrimitiveType.Address) {
//         return AddressValue.decodeTopLevel(buffer);
//     }

//     // TODO: For user-defined types, call decode.
//     throw new errors.ErrUnsupportedOperation("decodeTopLevel", `unknown type "${type}"`);
// }

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