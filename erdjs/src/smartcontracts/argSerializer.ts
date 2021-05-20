import { BinaryCodec } from "./codec";
import { Type, EndpointParameterDefinition, TypedValue, OptionValue, OptionType, NumericalType, BytesValue, BytesType, U8Value, U16Type, U16Value, U32Value, U32Type, U8Type, U64Type, U64Value, BigUIntType, BigUIntValue, BigIntType, BigIntValue, I8Type, I8Value, I16Type, I16Value, I32Value, I32Type, I64Value, I64Type, PrimitiveType, AddressType, AddressValue, BooleanType, BooleanValue, TokenIdentifierValue, TokenIdentifierType, EndpointDefinition, ListType, List } from "./typesystem";
import { CompositeType, CompositeValue } from "./typesystem/composite";
import { VariadicType, VariadicValue } from "./typesystem/variadic";
import { OptionalType, OptionalValue } from "./typesystem/algebraic";
import BigNumber from "bignumber.js";
import { ErrInvalidArgument } from "../errors";
import { guardSameLength } from "../utils";
import { Address } from "../address";
import { Code } from "..";

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

    static handleVariadicArgs(args: any[], endpoint: EndpointDefinition) {
        let parameters = endpoint.input;

        let { min, max, variadic } = getArgumentsCardinality(parameters);

        if (!(min <= args.length && args.length <= max)) {
            throw new ErrInvalidArgument(`Wrong number of arguments for endpoint ${endpoint.name}: expected between ${min} and ${max} arguments, have ${args.length}`);
        }

        if (variadic) {
            let lastArgIndex = parameters.length - 1;
            let lastArg = args.slice(lastArgIndex);
            if (lastArg.length > 0) {
                args[lastArgIndex] = lastArg;
            }
        }
        return args;
    }

    /**
     * Interprets a set of native javascript values into a set of typed values, given parameter definitions.
     */
    static nativeToTypedValues(args: any[], endpoint: EndpointDefinition): TypedValue[] {
        args = args || [];
        this.handleVariadicArgs(args, endpoint);

        let parameters = endpoint.input;
        let values: TypedValue[] = [];

        for (let i in parameters) {
            let parameter = parameters[i];
            let errorContext = new ArgumentErrorContext(endpoint, i, parameter);
            let value = convertToTypedValue(args[i], parameter.type, errorContext);
            values.push(value);
        }

        return values;
    }
}

class ArgumentErrorContext {
    endpoint: EndpointDefinition;
    argumentIndex: string;
    parameterDefinition: EndpointParameterDefinition;

    constructor(endpoint: EndpointDefinition, argumentIndex: string, parameterDefinition: EndpointParameterDefinition) {
        this.endpoint = endpoint;
        this.argumentIndex = argumentIndex;
        this.parameterDefinition = parameterDefinition;
    }

    throwError(specificError: string): never {
        throw new ErrInvalidArgument(`Error when converting arguments for endpoint (endpoint name: ${this.endpoint.name}, argument index: ${this.argumentIndex}, name: ${this.parameterDefinition.name}, type: ${this.parameterDefinition.type})\nNested error: ${specificError}`);
    }

    convertError(native: any, typeName: string): never {
        this.throwError(`Can't convert argument (argument: ${native}, type ${typeof native}), wanted type: ${typeName})`);
    }

    unhandledType(functionName: string, type: Type): never {
        this.throwError(`Unhandled type (function: ${functionName}, type: ${type})`);
    }
}

// A function may have one of the following formats:
// f(arg1, arg2, optional<arg3>, optional<arg4>) returns { min: 2, max: 4, variadic: false }
// f(arg1, variadic<bytes>) returns { min: 1, max: Infinity, variadic: true }
// f(arg1, arg2, optional<arg3>, arg4, optional<arg5>, variadic<bytes>) returns { min: 4, max: Infinity, variadic: true }
function getArgumentsCardinality(parameters: EndpointParameterDefinition[]): { min: number, max: number, variadic: boolean } {
    let reversed = [...parameters].reverse(); // keep the original unchanged
    let min = parameters.length;
    let max = parameters.length;
    let variadic = false;
    if (reversed.length > 0 && reversed[0].type.getCardinality().isComposite()) {
        max = Infinity;
        variadic = true;
    }
    for (let parameter of reversed) {
        if (parameter.type.getCardinality().isSingular()) {
            break;
        }
        min -= 1;
    }
    return { min, max, variadic };
}

function convertToTypedValue(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    if (type instanceof OptionType) {
        return toOptionValue(native, type, errorContext);
    }
    if (type instanceof OptionalType) {
        return toOptionalValue(native, type, errorContext);
    }
    if (type instanceof VariadicType) {
        return toVariadicValue(native, type, errorContext);
    }
    if (type instanceof CompositeType) {
        return toCompositeValue(native, type, errorContext);
    }
    if (type instanceof ListType) {
        return toListValue(native, type, errorContext);
    }
    if (type instanceof PrimitiveType) {
        return toPrimitive(native, type, errorContext);
    }
    errorContext.throwError(`convertToTypedValue: unhandled type ${type}`);
}

function toOptionValue(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    if (native == null) {
        return OptionValue.newMissing();
    }
    let converted = convertToTypedValue(native, type.getFirstTypeParameter(), errorContext);
    return OptionValue.newProvided(converted);
}

function toOptionalValue(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    if (native == null) {
        return new OptionalValue(type);
    }
    let converted = convertToTypedValue(native, type.getFirstTypeParameter(), errorContext);
    return new OptionalValue(type, converted);
}

function toVariadicValue(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    if (native.map === undefined) {
        errorContext.convertError(native, "Variadic");
    }
    let converted = native.map(function (item: any) {
        return convertToTypedValue(item, type.getFirstTypeParameter(), errorContext);
    });
    return new VariadicValue(type, converted);
}

function toListValue(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    if (native.map === undefined) {
        errorContext.convertError(native, "List");
    }
    let converted = native.map(function (item: any) {
        return convertToTypedValue(item, type.getFirstTypeParameter(), errorContext);
    });
    return new List(type, converted);
}

function toCompositeValue(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    let typedValues = [];
    let typeParameters = type.getTypeParameters();
    guardSameLength(native, typeParameters);
    for (let i in typeParameters) {
        typedValues.push(convertToTypedValue(native[i], typeParameters[i], errorContext));
    }

    return new CompositeValue(type, typedValues);
}

function toPrimitive(native: any, type: Type, errorContext: ArgumentErrorContext): TypedValue {
    if (type instanceof NumericalType) {
        let number = new BigNumber(native);
        return convertNumericalType(number, type, errorContext);
    }
    if (type instanceof BytesType) {
        return convertNativeToBytesValue(native, errorContext);
    }
    if (type instanceof AddressType) {
        return new AddressValue(convertNativeToAddress(native, errorContext));
    }
    if (type instanceof BooleanType) {
        return new BooleanValue(native);
    }
    if (type instanceof TokenIdentifierType) {
        return new TokenIdentifierValue(convertNativeToBuffer(native, errorContext));
    }
    errorContext.throwError(`(function: toPrimitive) unsupported type ${type}`);
}

function convertNativeToBytesValue(native: any, errorContext: ArgumentErrorContext) {
    if (native instanceof Code) {
        return BytesValue.fromHex(native.toString());
    }
    if (native instanceof Buffer) {
        return new BytesValue(native);
    }
    if (typeof native === "string") {
        return BytesValue.fromUTF8(native);
    }
    errorContext.convertError(native, "BytesValue");
}

function convertNativeToBuffer(native: any, errorContext: ArgumentErrorContext): Buffer {
    if (native instanceof Buffer) {
        return native;
    }
    if (typeof native === "string") {
        return Buffer.from(native);
    }
    errorContext.convertError(native, "Buffer");
}

function convertNativeToAddress(native: any, errorContext: ArgumentErrorContext): Address {
    if (native instanceof Address) {
        return native;
    }
    if (typeof native === "string" || native instanceof Buffer) {
        return new Address(native);
    }
    if (native.getAddress !== undefined) { // ContractWrapper, SmartContract
        return native.getAddress();
    }
    if (native.address !== undefined) { // TestWallet
        return native.address;
    }
    errorContext.convertError(native, "Address");
}

function convertNumericalType(number: BigNumber, type: Type, errorContext: ArgumentErrorContext): TypedValue {
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
    errorContext.unhandledType("convertNumericalType", type);
}
