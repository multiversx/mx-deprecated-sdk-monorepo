import { EnumType, U8Type, U8Value, EnumValue } from "../typesystem";
import { BinaryCodec } from "./binary";

export class EnumBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    decodeTopLevel(buffer: Buffer, type: EnumType): EnumValue {
        let [decoded] = this.decodeNested(buffer, type);
        return decoded;
    }

    decodeNested(buffer: Buffer, type: EnumType): [EnumValue, number] {
        // Read as plain byte
        let [value, length] = this.parentCodec.decodeNested(buffer, new U8Type());
        let enumValue = EnumValue.fromDiscriminant(type, Number(value.valueOf()));
        return [enumValue, length];
    }

    encodeNested(enumValue: EnumValue): Buffer {
        let value = new U8Value(enumValue.discriminant);
        let buffer = this.parentCodec.encodeNested(value);
        return buffer;
    }

    encodeTopLevel(enumValue: EnumValue): Buffer {
        return this.encodeNested(enumValue);
    }
}
