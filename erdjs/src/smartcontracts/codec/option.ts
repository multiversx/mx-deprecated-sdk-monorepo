import * as errors from "../../errors";
import { BetterType, OptionValue } from "../typesystem";
import { BinaryCodec } from "./binary";

export class OptionValueBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;
    }

    /**
     * Reads and decodes an OptionValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeNested(buffer: Buffer, type: BetterType): [OptionValue, number] {
        if (buffer[0] == 0x00) {
            return [new OptionValue(type), 1];
        }

        let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer.slice(1), type);
        return [new OptionValue(type, decoded), decodedLength + 1];
    }

    /**
     * Reads and decodes an OptionValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     */
    decodeTopLevel(buffer: Buffer, type: BetterType): OptionValue {
        if (buffer.length == 0) {
            return new OptionValue(type);
        }

        if (buffer[0] != 0x01) {
            throw new errors.ErrCodec("invalid buffer for optional value");
        }

        let [decoded, decodedLength] = this.parentCodec.decodeNested(buffer.slice(1), type);
        return new OptionValue(type, decoded);
    }

    encodeNested(optionValue: OptionValue): Buffer {
        if (optionValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.parentCodec.encodeNested(optionValue.getTypedValue())]);
        }

        return Buffer.from([0]);
    }

    encodeTopLevel(optionValue: OptionValue): Buffer {
        if (optionValue.isSet()) {
            return Buffer.concat([Buffer.from([1]), this.parentCodec.encodeNested(optionValue.getTypedValue())]);
        }

        return Buffer.from([]);
    }
}
