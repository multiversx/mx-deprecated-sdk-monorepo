import * as errors from "../../errors";
import { BetterType, EndpointDefinition, onTypedValueSelect, onTypeSelect, PrimitiveType, StructType, TypedValue, U8Type } from "../typesystem";
import { guardSameLength } from "../../utils";
import { OptionalValueBinaryCodec } from "./optional";
import { PrimitiveBinaryCodec } from "./primitive";
import { ListBinaryCodec } from "./list";
import { StructureBinaryCodec } from "./struct";

export class BinaryCodec {
    readonly constraints: BinaryCodecConstraints;
    private readonly optionalCodec: OptionalValueBinaryCodec;
    private readonly listCodec: ListBinaryCodec;
    private readonly primitiveCodec: PrimitiveBinaryCodec;
    private readonly structureCodec: StructureBinaryCodec;
    
    constructor(constraints: BinaryCodecConstraints | null = null) {
        this.constraints = constraints || new BinaryCodecConstraints();
        this.optionalCodec = new OptionalValueBinaryCodec(this);
        this.listCodec = new ListBinaryCodec(this);
        this.primitiveCodec = new PrimitiveBinaryCodec(this);
        this.structureCodec = new  StructureBinaryCodec(this);
    }

    decodeOutput(outputItems: Buffer[], definition: EndpointDefinition): TypedValue[] {
        guardSameLength(outputItems, definition.output);

        let result: TypedValue[] = [];

        // For output parameters, top-level decoding is normally used.
        for (let i = 0; i < outputItems.length; i++) {
            let buffer = outputItems[i];
            let parameterDefinition = definition.output[i];
            let typeDescriptor = parameterDefinition.type;

            let decoded = this.decodeTopLevel(buffer, typeDescriptor);
            result.push(decoded);
        }

        return result;
    }

    decodeTopLevel<TResult extends TypedValue = TypedValue>(buffer: Buffer, type: BetterType): TResult {
        this.constraints.checkBufferLength(buffer);

        let typedValue = onTypeSelect<TypedValue>(type, {
            onOptional: () => this.optionalCodec.decodeTopLevel(buffer, type.getFirstTypeParameter()),
            onList: () => this.listCodec.decodeTopLevel(buffer, type.getFirstTypeParameter()),
            onPrimitive: () => this.primitiveCodec.decodeTopLevel(buffer, <PrimitiveType>type),
            onStructure: () => this.structureCodec.decodeTopLevel(buffer, <StructType>type)
        });

        return <TResult>typedValue;
    }

    decodeNested<TResult extends TypedValue = TypedValue>(buffer: Buffer, type: BetterType): [TResult, number] {
        this.constraints.checkBufferLength(buffer);

        let [typedResult, decodedLength] = onTypeSelect<[TypedValue, number]>(type, {
            onOptional: () => this.optionalCodec.decodeNested(buffer, type.getFirstTypeParameter()),
            onList: () => this.listCodec.decodeNested(buffer, type.getFirstTypeParameter()),
            onPrimitive: () => this.primitiveCodec.decodeNested(buffer, <PrimitiveType>type),
            onStructure: () => this.structureCodec.decodeNested(buffer, <StructType>type)
        });

        return [<TResult>typedResult, decodedLength];
    }

    encodeNested(typedValue: any): Buffer {
        return onTypedValueSelect(typedValue, {
            onPrimitive: () => this.primitiveCodec.encodeNested(typedValue),
            onOptional: () => this.optionalCodec.encodeNested(typedValue),
            onList: () => this.listCodec.encodeNested(typedValue),
            onStructure: () => this.structureCodec.encodeNested(typedValue)
        });
    }

    encodeTopLevel(typedValue: any): Buffer {
        return onTypedValueSelect(typedValue, {
            onPrimitive: () => this.primitiveCodec.encodeTopLevel(typedValue),
            onOptional: () => this.optionalCodec.encodeTopLevel(typedValue),
            onList: () => this.listCodec.encodeTopLevel(typedValue),
            onStructure: () => this.structureCodec.encodeTopLevel(typedValue)
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
     * This constraint avoids computer-freezing decode bugs (e.g. due to invalid ABI or structure definitions).
     */
    checkListLength(length: number) {
        if (length > this.maxListLength) {
            throw new errors.ErrCodec(`List too large: ${length} > ${this.maxListLength}`);
        }
    }
}
