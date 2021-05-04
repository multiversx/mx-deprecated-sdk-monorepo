import { ContractCallPayloadBuilder, ContractDeployPayloadBuilder, ContractUpgradePayloadBuilder } from "./smartcontracts/transactionPayloadBuilders";

/**
 * The "data" field of a {@link Transaction}, as an immutable object.
 */
export class TransactionPayload {
    private readonly data: Buffer;

    /**
     * Creates a TransactionPayload from a utf-8 string or from a buffer.
     */
    constructor(data?: string | Buffer) {
        this.data = Buffer.from(data || []);
    }

    /**
     * Creates a TransactionPayload from a base-64 encoded string.
     */
    static fromEncoded(encoded?: string): TransactionPayload {
        if (!encoded) {
            return new TransactionPayload("");
        }

        let decoded = Buffer.from(encoded, "base64").toString();
        return new TransactionPayload(decoded);
    }

    /**
     * Returns whether the "data" is void.
     */
    isEmpty(): boolean {
        return this.data.length == 0;
    }

    /**
     * Returns the base-64 representation of the data.
     */
    encoded(): string {
        return this.data.toString("base64");
    }

    /**
     * Returns the data as a buffer.
     */
    valueOf(): Buffer {
        return this.data;
    }

    toString() {
        return this.data.toString();
    }

    getEncodedArguments(): string[] {
        return this.toString().split("@");
    }

    getRawArguments(): Buffer[] {
        return this.getEncodedArguments().map(argument => Buffer.from(argument, "hex"));
    }

    /**
     * Returns the length of the data.
     */
    length(): number {
        return Buffer.from(this.data).length;
    }

    /**
     * Returns a new builder, to be used for contract deploy transactions.
     */
    static contractDeploy(): ContractDeployPayloadBuilder {
        return new ContractDeployPayloadBuilder();
    }

    /**
     * Returns a new builder, to be used for contract upgrade transactions.
     */
    static contractUpgrade(): ContractUpgradePayloadBuilder {
        return new ContractUpgradePayloadBuilder();
    }

    /**
     * Returns a new builder, to be used for contract call transactions.
     */
    static contractCall(): ContractCallPayloadBuilder {
        return new ContractCallPayloadBuilder();
    }
}
