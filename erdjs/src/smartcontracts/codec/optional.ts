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
     * 
     * @param buffer the input buffer
     */
    decodeNested(buffer: Buffer, typeDescriptor: TypeDescriptor): [OptionalValue, number] {
        throw new Error("Method not implemented.");
    }

    /**
     * Reads and decodes an OptionalValue from a given buffer,
     * with respect to: {@link https://docs.elrond.com/developers/developer-reference/the-elrond-serialization-format | The Elrond Serialization Format}. 
     * 
     * @param buffer the input buffer
     */
    decodeTopLevel(buffer: Buffer, typeDescriptor: TypeDescriptor): OptionalValue {
        throw new Error("Method not implemented.");
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