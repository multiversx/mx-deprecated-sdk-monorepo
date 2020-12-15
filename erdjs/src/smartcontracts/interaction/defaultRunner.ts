import { IProvider, ISigner } from "../../interface";
import { NonceTracker } from "../../nonce";
import { IInteractionChecker, IInteractionRunner } from "./interface";
import { Interaction } from "./interaction";
import { Transaction, TransactionHash, TransactionOnNetwork } from "../../transaction";
import { Address } from "../../address";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";

export class DefaultInteractionRunner implements IInteractionRunner {
    private readonly checker: IInteractionChecker;
    private readonly signer: ISigner;
    private readonly provider: IProvider;
    private readonly nonceTracker: NonceTracker;

    constructor(checker: IInteractionChecker, signer: ISigner, provider: IProvider) {
        this.checker = checker;
        this.signer = signer;
        this.provider = provider;
        this.nonceTracker = new NonceTracker(signer.getAddress(), provider);
    }

    async broadcast(transaction: Transaction): Promise<Transaction> {
        let nonce = await this.nonceTracker.getNonce();
        transaction.setNonce(nonce);
        await this.signer.sign(transaction);
        await transaction.send(this.provider);
        this.nonceTracker.onTransactionBroadcastedWithSuccess();

        return transaction;
    }

    async broadcastAwaitExecution(transaction: Transaction): Promise<TransactionOnNetwork> {
        await this.broadcast(transaction);
        await transaction.awaitExecuted(this.provider);

        return await transaction.getAsOnNetwork(this.provider);
    }

    async query(query: Query, caller?: Address): Promise<QueryResponse> {
        query.caller = caller || this.signer.getAddress();
        let response = await this.provider.queryContract(query);

        return response;
    }

    async simulate(transaction: Transaction): Promise<any> {
        let nonce = await this.nonceTracker.getNonce();
        transaction.setNonce(nonce);
        await this.signer.sign(transaction);

        return await transaction.simulate(this.provider);
    }

    checkInteraction(interaction: Interaction) {
        this.checker.checkInteraction(interaction);
    }
}
