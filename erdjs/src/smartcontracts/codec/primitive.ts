import { PrimitiveType, PrimitiveValue, onPrimitiveTypeSelect, NumericalType, onPrimitiveValueSelect, BooleanValue, NumericalValue, AddressValue } from "../typesystem";
import { AddressBinaryCodec } from "./address";
import { BooleanBinaryCodec } from "./boolean";
import { BinaryCodec } from "./binary";
import { NumericalBinaryCoded } from "./numerical";

export class PrimitiveBinaryCodec {
    private readonly parentCodec: BinaryCodec;

    private readonly booleanCodec: BooleanBinaryCodec;
    private readonly numericalCodec: NumericalBinaryCoded;
    private readonly addressCoded: AddressBinaryCodec;

    constructor(parentCodec: BinaryCodec) {
        this.parentCodec = parentCodec;

        this.booleanCodec = new BooleanBinaryCodec();
        this.numericalCodec = new NumericalBinaryCoded();
        this.addressCoded = new AddressBinaryCodec();
    }

    decodeNested(buffer: Buffer, type: PrimitiveType): [PrimitiveValue, number] {
        return onPrimitiveTypeSelect<[PrimitiveValue, number]>(type, {
            onBoolean: () => this.booleanCodec.decodeNested(buffer),
            onNumerical: () => this.numericalCodec.decodeNested(buffer, <NumericalType>type),
            onAddress: () => this.addressCoded.decodeNested(buffer)
        });
    }

    decodeTopLevel(buffer: Buffer, type: PrimitiveType): PrimitiveValue {
        return onPrimitiveTypeSelect<PrimitiveValue>(type, {
            onBoolean: () => this.booleanCodec.decodeTopLevel(buffer),
            onNumerical: () => this.numericalCodec.decodeTopLevel(buffer, <NumericalType>type),
            onAddress: () => this.addressCoded.decodeTopLevel(buffer)
        });
    }

    encodeNested(value: PrimitiveValue): Buffer {
        return onPrimitiveValueSelect<Buffer>(value, {
            onBoolean: () => this.booleanCodec.encodeNested(<BooleanValue>value),
            onNumerical: () => this.numericalCodec.encodeNested(<NumericalValue>value),
            onAddress: () => this.addressCoded.encodeNested(<AddressValue>value)
        });
    }

    encodeTopLevel(value: PrimitiveValue): Buffer {
        return onPrimitiveValueSelect<Buffer>(value, {
            onBoolean: () => this.booleanCodec.encodeTopLevel(<BooleanValue>value),
            onNumerical: () => this.numericalCodec.encodeTopLevel(<NumericalValue>value),
            onAddress: () => this.addressCoded.encodeTopLevel(<AddressValue>value)
        });
    }
}
