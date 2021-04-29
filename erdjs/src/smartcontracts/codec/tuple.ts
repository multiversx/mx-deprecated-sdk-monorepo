import { Struct, TupleType, Tuple } from "../typesystem";
import { BinaryCodec } from "./binary";
import { StructBinaryCodec } from "./struct";

export class TupleBinaryCodec {
    private structCodec: StructBinaryCodec;

    constructor(binaryCodec: BinaryCodec) {
        this.structCodec = new StructBinaryCodec(binaryCodec);
    }

    decodeTopLevel(buffer: Buffer, type: TupleType): Tuple {
        return this.structCodec.decodeTopLevel(buffer, type);
    }

    decodeNested(buffer: Buffer, type: TupleType): [Tuple, number] {
        return this.structCodec.decodeNested(buffer, type);
    }

    encodeNested(struct: Tuple): Buffer {
        return this.structCodec.encodeNested(struct);
    }

    encodeTopLevel(struct: Struct): Buffer {
        return this.structCodec.encodeTopLevel(struct);
    }
}
