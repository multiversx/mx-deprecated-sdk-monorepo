import { guardValueIsSet } from "../utils";
import { BinaryCodec } from "./codec";
import { EndpointDefinition, TypedValue } from "./typesystem";

/**
 * Outcome is an abstraction that encapsulates contract return data from queries and SCRs.
 */
export class Outcome {
    /**
     * For the moment, this is the only codec used.
     */
    private static codec = new BinaryCodec();

    private readonly isTyped: boolean;
    private readonly outcomeItems: OutcomeItem[];

    constructor(buffers: Buffer[], endpointDefinition?: EndpointDefinition) {
        this.isTyped = endpointDefinition ? true : false;

        let typedValues = this.isTyped ? Outcome.codec.decodeOutput(buffers, endpointDefinition!) : [];
        let outcomeItems = buffers.map((buffer, index) => new OutcomeItem(buffer, typedValues[index]));

        this.outcomeItems = outcomeItems;
    }

    static fromQueryResponse(items: string[], endpointDefinition?: EndpointDefinition): Outcome {
        return Outcome.fromArrayBase64(items, endpointDefinition);
    }

    static fromArrayBase64(items: string[], endpointDefinition?: EndpointDefinition): Outcome {
        items = items || [];
        let buffers = items.map(item => Buffer.from(item, "base64"));
        return new Outcome(buffers, endpointDefinition);
    }

    static fromExecutionResponse(items: string[], endpointDefinition?: EndpointDefinition): Outcome {
        return this.fromArrayHex(items, endpointDefinition);
    }

    static fromArrayHex(items: string[], endpointDefinition?: EndpointDefinition): Outcome {
        items = items || [];
        let buffers = items.map(item => Buffer.from(item, "hex"));
        return new Outcome(buffers, endpointDefinition);
    }

    items(): ReadonlyArray<OutcomeItem> {
        return this.outcomeItems;
    }

    firstItem(): OutcomeItem {
        return this.items()[0];
    }

    values(): ReadonlyArray<TypedValue> {
        guardValueIsSet("isTyped", this.isTyped);
        let values = this.items().map(item => item.value());
        return values;
    }

    firstValue(): TypedValue {
        return this.values()[0];
    }
}

export class OutcomeItem {
    private readonly asBuffer: Buffer;
    private readonly asTypedValue?: TypedValue;

    constructor(buffer: Buffer, typedValue?: TypedValue) {
        this.asBuffer = buffer;
        this.asTypedValue = typedValue;
    }

    /**
     * Provides the decoded value, as a typed value.
     */
    value(): TypedValue {
        guardValueIsSet("typedValue", this.asTypedValue);
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

    private hex(): string {
        return this.asBuffer.toString("hex");
    }
}

