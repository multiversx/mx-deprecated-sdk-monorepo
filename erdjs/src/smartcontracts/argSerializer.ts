import { BinaryCodec } from "./codec";
import { Type, EndpointParameterDefinition, TypedValue, OptionValue, OptionType, NumericalType, BytesValue, BytesType, U8Value, U16Type, U16Value, U32Value, U32Type, U8Type, U64Type, U64Value, BigUIntType, BigUIntValue, BigIntType, BigIntValue, I8Type, I8Value, I16Type, I16Value, I32Value, I32Type, I64Value, I64Type, PrimitiveType } from "./typesystem";
import { CompositeType, CompositeValue } from "./typesystem/composite";
import { VariadicType, VariadicValue } from "./typesystem/variadic";
import { OptionalType, OptionalValue } from "./typesystem/algebraic";
import BigNumber from "bignumber.js";
import { ErrInvariantFailed } from "../errors";

export const ArgumentsSeparator = "@";

/**
 * For the moment, this is the only codec used.
 */
const Codec = new BinaryCodec();

export class ArgSerializer {
    /**
     * Reads typed values from an arguments string (e.g. aa@bb@@cc), given parameter definitions.
     */
    stringToValues(joinedString: string, parameters: EndpointParameterDefinition[]): TypedValue[] {
        let buffers = this.stringToBuffers(joinedString);
        let values = this.buffersToValues(buffers, parameters);
        return values;
    }

    /**
     * Reads raw buffers from an arguments string (e.g. aa@bb@@cc).
     */
    stringToBuffers(joinedString: string): Buffer[] {
        // We also keep the zero-length buffers (they could encode missing options, Option<T>).
        return joinedString.split(ArgumentsSeparator).map(item => Buffer.from(item, "hex"));
    }

    /**
     * Decodes a set of buffers into a set of typed values, given parameter definitions.
     */
    buffersToValues(buffers: Buffer[], parameters: EndpointParameterDefinition[]): TypedValue[] {
        // TODO: Refactor, split (function is quite complex).

        buffers = buffers || [];

        let values: TypedValue[] = [];
        let bufferIndex = 0;
        let numBuffers = buffers.length;

        for (let i = 0; i < parameters.length; i++) {
            let parameter = parameters[i];
            let type = parameter.type;
            let value = readValue(type);
            values.push(value);
        }

        // This is a recursive function.
        function readValue(type: Type): TypedValue {
            // TODO: Use matchers.

            if (type instanceof OptionalType) {
                let typedValue = readValue(type.getFirstTypeParameter());
                return new OptionalValue(type, typedValue);
            } else if (type instanceof VariadicType) {
                let typedValues = [];

                while (!hasReachedTheEnd()) {
                    typedValues.push(readValue(type.getFirstTypeParameter()));
                }

                return new VariadicValue(type, typedValues);
            } else if (type instanceof CompositeType) {
                let typedValues = [];

                for (const typeParameter of type.getTypeParameters()) {
                    typedValues.push(readValue(typeParameter));
                }

                return new CompositeValue(type, typedValues);
            } else {
                // Non-composite (singular), non-variadic (fixed) type.
                // The only branching without a recursive call.
                let typedValue = decodeNextBuffer(type);
                return typedValue!;
            }
        }

        function decodeNextBuffer(type: Type): TypedValue | null {
            if (hasReachedTheEnd()) {
                return null;
            }

            let buffer = buffers[bufferIndex++];
            let decodedValue = Codec.decodeTopLevel(buffer, type);
            return decodedValue;
        }

        function hasReachedTheEnd() {
            return bufferIndex >= numBuffers;
        }

        return values;
    }

    /**
     * Serializes a set of typed values into an arguments string (e.g. aa@bb@@cc).
     */
    valuesToString(values: TypedValue[]): string {
        let strings = this.valuesToStrings(values);
        let joinedString = strings.join(ArgumentsSeparator);
        return joinedString;
    }

    /**
     * Serializes a set of typed values into a set of strings.
     */
    valuesToStrings(values: TypedValue[]): string[] {
        let buffers = this.valuesToBuffers(values);
        let strings = buffers.map(buffer => buffer.toString("hex"));
        return strings;
    }

    /**
     * Serializes a set of typed values into a set of strings buffers.
     * Variadic types and composite types might result into none, one or more buffers.
     */
    valuesToBuffers(values: TypedValue[]): Buffer[] {
        // TODO: Refactor, split (function is quite complex).

        let buffers: Buffer[] = [];

        for (const value of values) {
            handleValue(value);
        }

        // This is a recursive function. It appends to the "buffers" variable.
        function handleValue(value: TypedValue): void {
            // TODO: Use matchers.

            if (value instanceof OptionalValue) {
                if (value.isSet()) {
                    handleValue(value.getTypedValue());
                }
            } else if (value instanceof VariadicValue) {
                for (const item of value.getItems()) {
                    handleValue(item);
                }
            } else if (value instanceof CompositeValue) {
                for (const item of value.getItems()) {
                    handleValue(item);
                }
            } else {
                // Non-composite (singular), non-variadic (fixed) type.
                // The only branching without a recursive call.
                let buffer: Buffer = Codec.encodeTopLevel(value);
                buffers.push(buffer);
            }
        }

        return buffers;
    }

    /**
     * Interprets a set of native javascript values into a set of typed values, given parameter definitions.
     */
    static nativeToValues(buffers: any[], parameters: EndpointParameterDefinition[]): TypedValue[] {
        buffers = buffers || [];

        let values: TypedValue[] = [];
        let bufferIndex = 0;
        let numBuffers = buffers.length;

        for (let i = 0; i < parameters.length; i++) {
            let parameter = parameters[i];
            let type = parameter.type;
            let value = convertToTypedValue(buffers[i], type);
            values.push(value);
        }

        return values;
    }
}

function convertToTypedValue(native: any, type: Type): TypedValue {
    if (type instanceof OptionType) {
        return toOptionValue(native, type);
    }
    if (type instanceof VariadicType) {
        return toVariadicValue(native, type);
    }
    if (type instanceof CompositeType) {
        return toCompositeType(native, type);
    }
    if (type instanceof PrimitiveType) {
        return toPrimitive(native, type);
    }
    throw new ErrInvariantFailed(`convertToTypedValue: unhandled type ${type}`);
}

function toOptionValue(native: any, type: Type): TypedValue {
    if (native == null) {
        return OptionValue.newMissing();
    }
    let converted = convertToTypedValue(native, type.getFirstTypeParameter());
    return OptionValue.newProvided(converted);
}

function toVariadicValue(native: any, type: Type): TypedValue {
    let converted = native.map(function (item: any) {
        return convertToTypedValue(item, type.getFirstTypeParameter());
    });
    return new VariadicValue(type, converted);
}

function toCompositeType(native: any, type: Type): TypedValue {
    let typedValues = [];
    let i = 0;
    for (const typeParameter of type.getTypeParameters()) {
        typedValues.push(convertToTypedValue(native[i], typeParameter));
        i += 1;
    }

    return new CompositeValue(type, typedValues);
}

function toPrimitive(native: any, type: Type): TypedValue {
    if (type instanceof NumericalType) {
        let number = new BigNumber(native);
        return convertNumericalType(number, type);
    }
    if (type instanceof BytesType) {
        return BytesValue.fromUTF8(native);
    }
    throw new ErrInvariantFailed(`unsupported type ${type}`);
}

function convertNumericalType(number: BigNumber, type: Type): TypedValue {
    if (type instanceof U8Type) {
        return new U8Value(number);
    }
    if (type instanceof I8Type) {
        return new I8Value(number);
    }
    if (type instanceof U16Type) {
        return new U16Value(number);
    }
    if (type instanceof I16Type) {
        return new I16Value(number);
    }
    if (type instanceof U32Type) {
        return new U32Value(number);
    }
    if (type instanceof I32Type) {
        return new I32Value(number);
    }
    if (type instanceof U64Type) {
        return new U64Value(number);
    }
    if (type instanceof I64Type) {
        return new I64Value(number);
    }
    if (type instanceof BigUIntType) {
        return new BigUIntValue(number);
    }
    if (type instanceof BigIntType) {
        return new BigIntValue(number);
    }
    throw new ErrInvariantFailed(`convertNumericalType: unhandled type ${type}`);
}
