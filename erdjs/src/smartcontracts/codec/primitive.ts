import { PrimitiveType, PrimitiveValue, onPrimitiveTypeSelect, NumericalType, onPrimitiveValueSelect, BooleanValue, NumericalValue, AddressValue, convertBytesToList, U8Type, ListType } from "../typesystem";
import { AddressBinaryCodec } from "./address";
import { BooleanBinaryCodec } from "./boolean";
import { BinaryCodec } from "./binary";
import { NumericalBinaryCodec } from "./numerical";
import { ListBinaryCodec } from "./list";
import { BytesValue } from "../typesystem/bytes";
import { H256BinaryCodec } from "./h256";
import { H256Type, H256Value } from "../typesystem/h256";

export class PrimitiveBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    private readonly booleanCodec: BooleanBinaryCodec;
    private readonly numericalCodec: NumericalBinaryCodec;
    private readonly addressCodec: AddressBinaryCodec;
    private readonly h256Codec: H256BinaryCodec;
    // We'll use this one for the "bytes" primitive (workaround).
    private readonly listCodec: ListBinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;

        this.booleanCodec = new BooleanBinaryCodec();
        this.numericalCodec = new NumericalBinaryCodec();
        this.addressCodec = new AddressBinaryCodec();
        this.h256Codec = new H256BinaryCodec();
        this.listCodec = new ListBinaryCodec(parentCodec);
    }

    decodeNested(buffer: Buffer, type: PrimitiveType): [PrimitiveValue, number] {
        return onPrimitiveTypeSelect<[PrimitiveValue, number]>(type, {
            onBoolean: () => this.booleanCodec.decodeNested(buffer),
            onNumerical: () => this.numericalCodec.decodeNested(buffer, <NumericalType>type),
            onAddress: () => this.addressCodec.decodeNested(buffer),
            // TODO: Convert to BytesValue (instead of List<u8>)
            onBytes: () => this.listCodec.decodeNested(buffer, new ListType(new U8Type())),
            onH256: () => this.h256Codec.decodeNested(buffer)
        });
    }

    decodeTopLevel(buffer: Buffer, type: PrimitiveType): PrimitiveValue {
        return onPrimitiveTypeSelect<PrimitiveValue>(type, {
            onBoolean: () => this.booleanCodec.decodeTopLevel(buffer),
            onNumerical: () => this.numericalCodec.decodeTopLevel(buffer, <NumericalType>type),
            onAddress: () => this.addressCodec.decodeTopLevel(buffer),
            // TODO: Convert to BytesValue (instead of List<u8>)
            onBytes: () => this.listCodec.decodeTopLevel(buffer, new ListType(new U8Type())),
            onH256: () => this.h256Codec.decodeTopLevel(buffer)
        });
    }

    encodeNested(value: PrimitiveValue): Buffer {
        return onPrimitiveValueSelect<Buffer>(value, {
            onBoolean: () => this.booleanCodec.encodeNested(<BooleanValue>value),
            onNumerical: () => this.numericalCodec.encodeNested(<NumericalValue>value),
            onAddress: () => this.addressCodec.encodeNested(<AddressValue>value),
            onBytes: () => this.listCodec.encodeNested(convertBytesToList(<BytesValue>value)),
            onH256: () => this.h256Codec.encodeNested(<H256Value>value)
        });
    }

    encodeTopLevel(value: PrimitiveValue): Buffer {
        return onPrimitiveValueSelect<Buffer>(value, {
            onBoolean: () => this.booleanCodec.encodeTopLevel(<BooleanValue>value),
            onNumerical: () => this.numericalCodec.encodeTopLevel(<NumericalValue>value),
            onAddress: () => this.addressCodec.encodeTopLevel(<AddressValue>value),
            onBytes: () => this.listCodec.encodeTopLevel(convertBytesToList(<BytesValue>value)),
            onH256: () => this.h256Codec.encodeTopLevel(<H256Value>value)
        });
    }
}
