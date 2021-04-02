import { EnumType, U8Type, U8Value, EnumValue } from "../typesystem";
import { BinaryCodec } from "./binary";

export class EnumBinaryCodec {
    private readonly binaryCodec: BinaryCodec;

    constructor(binaryCodec: BinaryCodec) {
        this.binaryCodec = binaryCodec;
    }

    decodeTopLevel(buffer: Buffer, type: EnumType): EnumValue {
        let value = this.binaryCodec.decodeTopLevel(buffer, new U8Type());
        let enumValue = EnumValue.fromDiscriminant(type, Number(value.valueOf()));
        return enumValue;
    }

    decodeNested(buffer: Buffer, type: EnumType): [EnumValue, number] {
        // Read as plain byte
        let [value, length] = this.binaryCodec.decodeNested(buffer, new U8Type());
        let enumValue = EnumValue.fromDiscriminant(type, Number(value.valueOf()));
        return [enumValue, length];
    }

    encodeNested(enumValue: EnumValue): Buffer {
        let value = new U8Value(enumValue.discriminant);
        let buffer = this.binaryCodec.encodeNested(value);
        return buffer;
    }

    encodeTopLevel(enumValue: EnumValue): Buffer {
        let value = new U8Value(enumValue.discriminant);
        let buffer = this.binaryCodec.encodeTopLevel(value);
        return buffer;
    }
}
