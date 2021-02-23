import { read } from "fs";
import { Address } from "../address";
import { guardTrue, guardValueIsSet } from "../utils";
import { BinaryCodec } from "./codec";
import { AddressValue, BigUIntValue, OptionType, OptionValue, TypedValue, TypePlaceholder, U8Type, U8Value, List, ListType, EndpointParameterDefinition, BetterType } from "./typesystem";
import { CompositeType, CompositeValue } from "./typesystem/composite";
import { OptionalType, OptionalValue, VariadicType, VariadicValue } from "./typesystem/variadic";

export const ArgumentsSeparator = "@";

/**
 * For the moment, this is the only codec used.
 */
const Codec = new BinaryCodec();

/**
 * Arguments is an abstraction that encapsulates contract input data and contract return data from queries and SCRs.
 */
export class Arguments {
    private readonly args: Argument[];

    constructor(args: Argument[]) {
        this.args = args;
    }

    static fromJoinedString(joined: string, parameters: EndpointParameterDefinition[]): Arguments {
        let buffers = Arguments.parseIntoBuffers(joined);
        let args = Arguments.fromBuffers(buffers, parameters);
        return args;
    }

    static parseIntoBuffers(input: string): Buffer[] {
        return input.split(ArgumentsSeparator).map(item => Buffer.from(item, "hex")).filter(item => item.length > 0);
    }

    /**
     * This function returns raw (untyped) {@link Argument} objects. 
     * Should be used only when there is no type information (e.g. ABI is missing).
     */
    static fromBuffersUntyped(buffers: Buffer[]): Arguments {
        buffers = buffers || [];
        return new Arguments(buffers.map(Argument.fromBytes));
    }

    // TODO: Refactor, split (function is quite complex).
    static fromBuffers(buffers: Buffer[], parameters: EndpointParameterDefinition[]): Arguments {
        buffers = buffers || [];

        let args: Argument[] = []
        let bufferIndex = 0;
        let numBuffers = buffers.length;

        for (let i = 0; i < parameters.length; i++) {
            let parameter = parameters[i];
            let type = parameter.type;
            let value = readValue(type);
            let arg = Argument.fromTypedValue(value);
            args.push(arg);
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

        return new Arguments(args);
    }

    items(): ReadonlyArray<Argument> {
        return this.args;
    }

    firstItem(): Argument {
        return this.items()[0];
    }

    valuesTyped(): TypedValue[] {
        let values = this.items().map(item => item.typedValue());
        return values;
    }

    firstValueTyped(): TypedValue {
        return this.valuesTyped()[0];
    }

    /**
     * Appends Argument objects to a given string. 
     * The resulted string is to be used for preparing Smart Contract calls (or deployments).
     * In general, this function should not be used directly. 
     * It is used by {@link TransactionPayload} builders (such as {@link ContractCallPayloadBuilder}), under the hood.
     * 
     * ```
     * let args = new Arguments([Argument.pubkey(alice), Argument.number(42)]);
     * let data = args.appendToString("transferToken");
     * let payload = new TransactionPayload(data);
     * ```
     */
    appendToString(to: string): string {
        if (this.args.length == 0) {
            return to;
        }
    
        this.args.forEach(arg => {
            to += ArgumentsSeparator + arg.hex();
        });
    
        return to;
    }
}

/**
 * The Argument abstraction (immutable) allows one to prepare arguments for Smart Contract calls (and deployments),
 * and to parse output arguments (from Smart Contract results or Query responses).
 * 
 * Design choice: we do not define two separate classes for input and output arguments, but a single one instead: this one.
 */
export class Argument {
    /**
     * The actual value of the argument, to be passed to the Protocol (will be hex-encoded).
     */
    private readonly asBuffer: Buffer;

    /**
     * An additional perspective over the argument: seen as a typed value (if type information is available).
     */
    private readonly asTypedValue?: TypedValue;

    /**
     * Creates an Argument object from the actual value.
     * 
     * The typed value, if provided, isn't checked against the required buffer parameter. 
     * Consistency is assumed (programmers should not normally call this constructor directly).
     */
    constructor(asBuffer: Buffer, asTypedValue?: TypedValue) {
        this.asBuffer = asBuffer;
        this.asTypedValue = asTypedValue;
    }

    /**
     * Creates an Argument object given a buffer (a sequence of bytes).
     */
    static fromBytes(buffer: Buffer): Argument {
        return new Argument(buffer);
    }

    /**
     * Creates an Argument object from a number.
     */
    static fromNumber(value: number): Argument {
        return Argument.fromBigInt(BigInt(value));
    }

    /**
     * Creates an Argument object from a big integer.
     */
    static fromBigInt(value: bigint): Argument {
        return Argument.fromTypedValue(new BigUIntValue(value));
    }

    /**
     * Creates an Argument object from an already-encoded hex string.
     */
    static fromHex(value: string): Argument {
        value = Argument.ensureEvenLength(value);
        let buffer = Buffer.from(value, "hex");
        return new Argument(buffer);
    }

    /**
     * Creates an Argument object from a utf-8 string.
     */
    static fromUTF8(value: string): Argument {
        let buffer = Buffer.from(value, "utf-8");
        let typedBytes = [...buffer].map(byte => new U8Value(byte));
        let type = new ListType(new U8Type());

        return Argument.fromTypedValue(new List(type, typedBytes));
    }

    /**
     * Creates an Argument object, as the pubkey of an {@link Address}.
     */
    static fromPubkey(value: Address): Argument {
        return Argument.fromTypedValue(new AddressValue(value));
    }

    /**
     * Creates an Argument object, as a missing option argument.
     */
    static fromMissingOption(): Argument {
        let type = new OptionType(new TypePlaceholder());
        return Argument.fromTypedValue(new OptionValue(type));
    }

    /**
     * Creates an Argument object, as a provided option argument.
     */
    static fromProvidedOption(typedValue: TypedValue): Argument {
        let type = new OptionType(typedValue.getType());
        return Argument.fromTypedValue(new OptionValue(type, typedValue));
    }

    static fromTypedValue(typedValue: TypedValue): Argument {
        let buffer = Codec.encodeTopLevel(typedValue);
        return new Argument(buffer, typedValue);
    }

    isTyped(): boolean {
        return this.asTypedValue ? true : false;
    }

    /**
     * Provides the value, as a typed value.
     */
    typedValue(): TypedValue {
        guardValueIsSet("asTypedValue", this.asTypedValue);
        return this.asTypedValue!;
    }

    buffer(): Buffer {
        return this.asBuffer;
    }

    /**
     * Provides best-effort decoding, when ABI is not available.
     * Only unsigned integers are supported.
     */
    number(): number {
        return parseInt(this.hex(), 16) || 0;
    }

    /**
     * Provides best-effort decoding, when ABI is not available.
     */
    bool(): boolean {
        return this.number() != 0;
    }

    /**
     * Provides best-effort decoding, when ABI is not available.
     * Only unsigned integers are supported.
     */
    bigInt(): bigint {
        return BigInt(`0x${this.hex() || "00"}`);
    }

    /**
     * Provides best-effort decoding, when ABI is not available.
     */
    utf8(): string {
        return this.asBuffer.toString("utf8");
    }

    hex(): string {
        let hex = this.asBuffer.toString("hex");
        return Argument.ensureEvenLength(hex);
    }

    private static ensureEvenLength(argument: string): string {
        return argument.length % 2 == 0 ? argument : "0" + argument;
    }

    toString(): string {
        return this.hex();
    }

    valueOf(): Buffer {
        return this.asBuffer;
    }
}

export class CompositeArgument {
    readonly parts: Argument[];

    constructor(parts: Argument[]) {
        this.parts = parts;
    }

    static fromTypedValues(typedValues: TypedValue[]): CompositeArgument {
        let parts = typedValues.map(item => Argument.fromTypedValue(item));
        return new CompositeArgument(parts);
    }

    toString(): string {
        return this.parts.map(part => part.hex()).join(ArgumentsSeparator);
    }

    valueOf(): Buffer[] {
        return this.parts.map(part => part.buffer());
    }
}
