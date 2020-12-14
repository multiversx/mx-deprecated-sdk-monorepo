import { IProvider, ISigner } from "../../interface";
import { NonceTracker } from "../../nonce";
import { IInteractionChecker, IInteractionRunner } from "./interface";
import { Interaction } from "./interaction";
import { Transaction, TransactionHash, TransactionOnNetwork } from "../../transaction";
import { Address } from "../../address";
import { Query, QueryResponse } from "../query";

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

    async broadcast(transaction: Transaction): Promise<TransactionHash> {
        await this.assignNonce(transaction);
        await this.sign(transaction);
        return await this.doBroadcast(transaction);
    }

    async broadcastAwaitExecution(transaction: Transaction): Promise<TransactionOnNetwork> {
        await this.broadcast(transaction);
        await transaction.awaitExecuted(this.provider);
        return await transaction.getAsOnNetwork(this.provider);
    }

    async query(query: Query, caller?: Address): Promise<QueryResponse> {
        query.caller = caller || this.signer.getAddress();
        return await this.provider.queryContract(query);
    }

    async simulate(transaction: Transaction): Promise<any> {
        await this.assignNonce(transaction);
        await this.sign(transaction);
        return await transaction.simulate(this.provider);
    }

    checkInteraction(interaction: Interaction) {
        this.checker.checkInteraction(interaction);
    }

    private async assignNonce(transaction: Transaction) {
        let nonce = await this.nonceTracker.getNonce();
        transaction.setNonce(nonce);
    }

    private async sign(transaction: Transaction) {
        await this.signer.sign(transaction);
    }

    private async doBroadcast(transaction: Transaction): Promise<TransactionHash> {
        let hash = await transaction.send(this.provider);
        this.nonceTracker.onTransactionBroadcastedWithSuccess();
        return hash;
    }
}
