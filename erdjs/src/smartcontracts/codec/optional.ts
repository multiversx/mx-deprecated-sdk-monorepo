import * as errors from "../../errors";
import { BetterType, OptionalValue } from "../typesystem";
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
    decodeNested(buffer: Buffer, type: BetterType): [OptionalValue, number] {
        if (buffer[0] == 0x00) {
            return [new OptionalValue(type), 1];
        }

        let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer.slice(1), type);
        return [new OptionalValue(type, decoded), decodedLength + 1];
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer, type: BetterType): OptionalValue {
        if (buffer.length == 0) {
            return new OptionalValue(type);
        }

        if (buffer[0] != 0x01) {
            throw new errors.ErrCodec("invalid buffer for optional value");
        }

        let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer.slice(1), type);
        return new OptionalValue(type, decoded);
    }

    encodeNested(optionalValue: OptionalValue): Buffer {
        if (optionalValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.parentCodec.encodeNested(optionalValue.getTypedValue())]);
        }

        return Buffer.from([0]);
    }

    encodeTopLevel(optionalValue: OptionalValue): Buffer {
        if (optionalValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.parentCodec.encodeNested(optionalValue.getTypedValue())]);
        }

        return Buffer.from([]);
    }
}
