import * as errors from "../../errors";
import { Type, OptionValue } from "../typesystem";
import { BinaryCodec } from "./binary";

/**
 * Encodes and decodes "OptionValue" objects
 * with respect to: {@link https://docs.elrond.com/developers/developer-reference/elrond-serialization-format/ | The Elrond Serialization Format}. 
 */
export class OptionValueBinaryCodec {
    private readonly binaryCodec: BinaryCodec;

    constructor(binaryCodec: BinaryCodec) {
        this.binaryCodec = binaryCodec;
    }

    decodeNested(buffer: Buffer, type: Type): [OptionValue, number] {
        if (buffer[0] == 0x00) {
            return [new OptionValue(type), 1];
        }

        if (buffer[0] != 0x01) {
            throw new errors.ErrCodec("invalid buffer for optional value");
        }

        let [decoded, decodedLength] = this.binaryCodec.decodeNested(buffer.slice(1), type);
        return [new OptionValue(type, decoded), decodedLength + 1];
    }

    decodeTopLevel(buffer: Buffer, type: Type): OptionValue {
        if (buffer.length == 0) {
            return new OptionValue(type);
        }

        if (buffer[0] != 0x01) {
            throw new errors.ErrCodec("invalid buffer for optional value");
        }

        let [decoded, decodedLength] = this.binaryCodec.decodeNested(buffer.slice(1), type);
        return new OptionValue(type, decoded);
    }

    encodeNested(optionValue: OptionValue): Buffer {
        if (optionValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.binaryCodec.encodeNested(optionValue.getTypedValue())]);
        }

        return Buffer.from([0]);
    }

    encodeTopLevel(optionValue: OptionValue): Buffer {
        if (optionValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.binaryCodec.encodeNested(optionValue.getTypedValue())]);
        }

        return Buffer.from([]);
    }
}
