import { Address } from "../../address";
import { IProvider, ISigner } from "../../interface";
import { NonceTracker } from "../../nonce";
import { TransactionHash } from "../../transaction";
import { QueryResponse } from "../query";
import { IInteractionRunner } from "./interface";
import { PreparedInteraction } from "./preparedInteraction";

export class DefaultInteractionRunner implements IInteractionRunner {
    private readonly signer: ISigner;
    private readonly provider: IProvider;
    private readonly nonceTracker: NonceTracker;

    constructor(signer: ISigner, provider: IProvider) {
        this.signer = signer;
        this.provider = provider;
        this.nonceTracker = new NonceTracker(signer.getAddress(), provider);
    }

    /**
     * Sets a correct (best-effort) nonce, signs the transaction, then broadcasts it.
     * Notifies the nonce tracker afterwards.
     */
    async runBroadcast(interaction: PreparedInteraction, awaitExecution: boolean = true): Promise<TransactionHash> {
        let nonce = await this.nonceTracker.getNonce();
        interaction.transaction.setNonce(nonce);

        await this.signer.sign(interaction.transaction);
        let hash = await interaction.transaction.send(this.provider);
        this.nonceTracker.onTransactionBroadcastedWithSuccess();

        if (awaitExecution) {
            await interaction.transaction.awaitExecuted(this.provider);
            // TODO: Also return status perhaps?
            // TODO: Also return SCRs?
        }

        return hash;
    }

    async runQuery(interaction: PreparedInteraction, caller?: Address): Promise<QueryResponse> {
        interaction.query.caller = caller || this.signer.getAddress();
        let response = await this.provider.queryContract(interaction.query);
        return response;
    }

    /**
     * Sets a correct (best-effort) nonce, signs the transaction, then dispatches it for simulation.
     * Does not increment nonce afterwards.
     */
    async runSimulate(interaction: PreparedInteraction): Promise<any> {
        let nonce = await this.nonceTracker.getNonce();
        interaction.transaction.setNonce(nonce);

        await this.signer.sign(interaction.transaction);
        let simulationResult = await interaction.transaction.simulate(this.provider);
        return simulationResult;
    }
}
