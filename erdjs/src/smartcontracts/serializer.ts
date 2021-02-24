import { BinaryCodec } from "./codec";
import { BetterType, EndpointParameterDefinition, TypedValue } from "./typesystem";
import { CompositeType, CompositeValue } from "./typesystem/composite";
import { OptionalType, OptionalValue, VariadicType, VariadicValue } from "./typesystem/variadic";

export const ArgumentsSeparator = "@";

/**
 * For the moment, this is the only codec used.
 */
const Codec = new BinaryCodec();

export class Serializer {
    stringToValues(joinedString: string, parameters: EndpointParameterDefinition[]): TypedValue[] {
        let buffers = this.stringToBuffers(joinedString);
        let values = this.buffersToValues(buffers, parameters);
        return values;
    }

    stringToBuffers(joinedString: string): Buffer[] {
        return joinedString.split(ArgumentsSeparator).map(item => Buffer.from(item, "hex")).filter(item => item.length > 0);
    }

    // TODO: Refactor, split (function is quite complex).
    buffersToValues(buffers: Buffer[], parameters: EndpointParameterDefinition[]): TypedValue[] {
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
        function readValue(type: BetterType): TypedValue {
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

        function decodeNextBuffer(type: BetterType): TypedValue | null {
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

    valuesToString(values: TypedValue[]): string {
        let strings = this.valuesToStrings(values);
        let joinedString = strings.join(ArgumentsSeparator);
        return joinedString;
    }

    valuesToStrings(values: TypedValue[]): string[] {
        let buffers = this.valuesToBuffers(values);
        let strings = buffers.map(buffer => buffer.toString("hex"));
        return strings;
    }

    valuesToBuffers(values: TypedValue[]): Buffer[] {
        let buffers = [];

        // TODO: Fix naive serialization, handle variadic types and composite types!
        for (const value of values) {
            let buffer = Codec.encodeTopLevel(value);
            buffers.push(buffer);
        }

        return buffers;
    }
}
