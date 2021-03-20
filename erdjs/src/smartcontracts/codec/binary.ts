import * as errors from "../../errors";
import { Type, EnumType, List, onTypedValueSelect, onTypeSelect, OptionValue, PrimitiveType, PrimitiveValue, Struct, StructType, TypedValue, EnumValue } from "../typesystem";
import { guardTrue, guardType } from "../../utils";
import { OptionValueBinaryCodec } from "./option";
import { PrimitiveBinaryCodec } from "./primitive";
import { ListBinaryCodec } from "./list";
import { StructBinaryCodec } from "./struct";
import { EnumBinaryCodec } from "./enum";

export class BinaryCodec {
    readonly constraints: BinaryCodecConstraints;
    private readonly optionCodec: OptionValueBinaryCodec;
    private readonly listCodec: ListBinaryCodec;
    private readonly primitiveCodec: PrimitiveBinaryCodec;
    private readonly structCodec: StructBinaryCodec;
    private readonly enumCodec: EnumBinaryCodec;
    
    constructor(constraints: BinaryCodecConstraints | null = null) {
        this.constraints = constraints || new BinaryCodecConstraints();
        this.optionCodec = new OptionValueBinaryCodec(this);
        this.listCodec = new ListBinaryCodec(this);
        this.primitiveCodec = new PrimitiveBinaryCodec(this);
        this.structCodec = new StructBinaryCodec(this);
        this.enumCodec = new EnumBinaryCodec(this);
    }

    decodeTopLevel<TResult extends TypedValue = TypedValue>(buffer: Buffer, type: Type): TResult {
        this.constraints.checkBufferLength(buffer);

        let typedValue = onTypeSelect<TypedValue>(type, {
            onOption: () => this.optionCodec.decodeTopLevel(buffer, type.getFirstTypeParameter()),
            onList: () => this.listCodec.decodeTopLevel(buffer, type),
            onPrimitive: () => this.primitiveCodec.decodeTopLevel(buffer, <PrimitiveType>type),
            onStruct: () => this.structCodec.decodeTopLevel(buffer, <StructType>type),
            onEnum: () => this.enumCodec.decodeTopLevel(buffer, <EnumType>type)
        });

        return <TResult>typedValue;
    }

    decodeNested<TResult extends TypedValue = TypedValue>(buffer: Buffer, type: Type): [TResult, number] {
        this.constraints.checkBufferLength(buffer);

        let [typedResult, decodedLength] = onTypeSelect<[TypedValue, number]>(type, {
            onOption: () => this.optionCodec.decodeNested(buffer, type.getFirstTypeParameter()),
            onList: () => this.listCodec.decodeNested(buffer, type),
            onPrimitive: () => this.primitiveCodec.decodeNested(buffer, <PrimitiveType>type),
            onStruct: () => this.structCodec.decodeNested(buffer, <StructType>type),
            onEnum: () => this.enumCodec.decodeNested(buffer, <EnumType>type)
        });

        return [<TResult>typedResult, decodedLength];
    }

    encodeNested(typedValue: TypedValue): Buffer {
        guardTrue(typedValue.getType().getCardinality().isSingular(), "singular cardinality, thus encodable type");
        
        return onTypedValueSelect(typedValue, {
            onPrimitive: () => this.primitiveCodec.encodeNested(<PrimitiveValue>typedValue),
            onOption: () => this.optionCodec.encodeNested(<OptionValue>typedValue),
            onList: () => this.listCodec.encodeNested(<List>typedValue),
            onStruct: () => this.structCodec.encodeNested(<Struct>typedValue),
            onEnum: () => this.enumCodec.encodeNested(<EnumValue>typedValue)
        });
    }

    encodeTopLevel(typedValue: TypedValue): Buffer {
        guardType("value", TypedValue, typedValue, false);
        guardTrue(typedValue.getType().getCardinality().isSingular(), "singular cardinality, thus encodable type");

        return onTypedValueSelect(typedValue, {
            onPrimitive: () => this.primitiveCodec.encodeTopLevel(<PrimitiveValue>typedValue),
            onOption: () => this.optionCodec.encodeTopLevel(<OptionValue>typedValue),
            onList: () => this.listCodec.encodeTopLevel(<List>typedValue),
            onStruct: () => this.structCodec.encodeTopLevel(<Struct>typedValue),
            onEnum: () => this.enumCodec.encodeTopLevel(<EnumValue>typedValue)
        });
    }
}

export class BinaryCodecConstraints {
    maxBufferLength: number;
    maxListLength: number;

    constructor(init?: Partial<BinaryCodecConstraints>) {
        this.maxBufferLength = init?.maxBufferLength || 4096;
        this.maxListLength = init?.maxListLength || 1024;
    }

    checkBufferLength(buffer: Buffer) {
        if (buffer.length > this.maxBufferLength) {
            throw new errors.ErrCodec(`Buffer too large: ${buffer.length} > ${this.maxBufferLength}`);
        }
    }

    /**
     * This constraint avoids computer-freezing decode bugs (e.g. due to invalid ABI or struct definitions).
     */
    checkListLength(length: number) {
        if (length > this.maxListLength) {
            throw new errors.ErrCodec(`List too large: ${length} > ${this.maxListLength}`);
        }
    }
}
