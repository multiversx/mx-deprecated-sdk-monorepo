import { ContractCallPayloadBuilder, ContractDeployPayloadBuilder, ContractUpgradePayloadBuilder } from "./smartcontracts/transactionPayloadBuilders";

export class TransactionPayload {
    private data: string;

    constructor(data?: string) {
        this.data = data || "";
    }

    static fromEncoded(encoded?: string): TransactionPayload {
        if (!encoded) {
            return new TransactionPayload("");
        }

        let decoded = Buffer.from(encoded, "base64").toString();
        return new TransactionPayload(decoded);
    }

    isEmpty(): boolean {
        return this.data.length == 0;
    }

    encoded(): string {
        return Buffer.from(this.data).toString("base64");
    }

    decoded(): string {
        return this.data;
    }

    length(): number {
        return this.data.length;
    }

    static contractDeploy(): ContractDeployPayloadBuilder {
        return new ContractDeployPayloadBuilder();
    }

    static contractUpgrade(): ContractUpgradePayloadBuilder {
        return new ContractUpgradePayloadBuilder();
    }

    static contractCall(): ContractCallPayloadBuilder {
        return new ContractCallPayloadBuilder();
    }
}
