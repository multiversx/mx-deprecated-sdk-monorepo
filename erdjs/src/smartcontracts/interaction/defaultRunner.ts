import { IProvider, ISigner } from "../../interface";
import { IInteractionChecker, IInteractionRunner } from "./interface";
import { Interaction } from "./interaction";
import { Transaction } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { Address } from "../../address";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";

export class DefaultInteractionRunner implements IInteractionRunner {
    private readonly checker: IInteractionChecker;
    private readonly signer: ISigner;
    private readonly provider: IProvider;

    constructor(checker: IInteractionChecker, signer: ISigner, provider: IProvider) {
        this.checker = checker;
        this.signer = signer;
        this.provider = provider;
    }

    async broadcast(transaction: Transaction): Promise<Transaction> {
        await this.signer.sign(transaction);
        await transaction.send(this.provider);
        return transaction;
    }

    async broadcastAwaitExecution(transaction: Transaction): Promise<TransactionOnNetwork> {
        await this.broadcast(transaction);
        await transaction.awaitExecuted(this.provider);
        // This will wait until the transaction is notarized, as well (so that SCRs are returned by the API).
        return await transaction.getAsOnNetwork(this.provider);
    }

    async query(query: Query, caller?: Address): Promise<QueryResponse> {
        query.caller = caller || this.signer.getAddress();
        let response = await this.provider.queryContract(query);
        return response;
    }

    async simulate(transaction: Transaction): Promise<any> {
        await this.signer.sign(transaction);
        return await transaction.simulate(this.provider);
    }

    checkInteraction(interaction: Interaction) {
        this.checker.checkInteraction(interaction);
    }
}
