import { ContractCallPayloadBuilder, ContractDeployPayloadBuilder, ContractUpgradePayloadBuilder } from "./smartcontracts/transactionPayloadBuilders";

/**
 * The "data" field of a {@link Transaction}, as an immutable object.
 */
export class TransactionPayload {
    private data: string;

    /**
     * Creates a TransactionPayload from a raw utf-8 string.
     */
    constructor(data?: string) {
        this.data = data || "";
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
        return Buffer.from(this.data).toString("base64");
    }

    /**
     * Returns the data as a utf-8 string.
     */
    decoded(): string {
        return this.data;
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
