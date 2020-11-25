import * as errors from "../../errors";
import { OptionalValue, TypeDescriptor } from "../typesystem";
import { BinaryCodec } from "./binary";

export class OptionalValueBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeNested(buffer: Buffer, typeDescriptor: TypeDescriptor): [OptionalValue, number] {
        if (buffer[0] == 0x00) {
            return [new OptionalValue(), 1];
        }

        let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer.slice(1), typeDescriptor);
        return [new OptionalValue(decoded), decodedLength + 1];
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer, typeDescriptor: TypeDescriptor): OptionalValue {
        if (buffer.length == 0) {
            return new OptionalValue();
        }

        if (buffer[0] != 0x01) {
            throw new errors.ErrCodec("invalid buffer for optional value");
        }

        let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer.slice(1), typeDescriptor);
        return new OptionalValue(decoded);
    }

    encodeNested(optionalValue: OptionalValue): Buffer {
        if (optionalValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.parentCodec.encodeNested(optionalValue)]);
        }

        return Buffer.from([0]);
    }

    encodeTopLevel(optionalValue: OptionalValue): Buffer {
        if (optionalValue.isSet()) {
            return this.parentCodec.encodeNested(optionalValue);
        }

        return Buffer.from([]);
    }
}