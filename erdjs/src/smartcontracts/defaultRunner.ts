import { IProvider, ISigner } from "../interface";
import { ExecutionResultsBundle, IInteractionChecker, IInteractionRunner, QueryResponseBundle } from "./interface";
import { Interaction } from "./interaction";
import { Transaction } from "../transaction";
import { Address } from "../address";

/**
 * An interaction runner suitable for backends or wallets.
 * Not suitable for dapps, which depend on external signers (wallets, ledger etc.).
 */
export class DefaultInteractionRunner implements IInteractionRunner {
    private readonly checker: IInteractionChecker;
    private readonly signer: ISigner;
    private readonly provider: IProvider;

    constructor(checker: IInteractionChecker, signer: ISigner, provider: IProvider) {
        this.checker = checker;
        this.signer = signer;
        this.provider = provider;
    }

    /**
     * Given an interaction, broadcasts its compiled transaction.
     */
    async run(interaction: Interaction): Promise<Transaction> {
        this.checkInteraction(interaction);

        let transaction = interaction.buildTransaction();
        await this.signer.sign(transaction);
        await transaction.send(this.provider);
        return transaction;
    }

    /**
     * Given an interaction, broadcasts its compiled transaction (and also waits for its execution on the Network).
     */
    async runAwaitExecution(interaction: Interaction): Promise<ExecutionResultsBundle> {
        this.checkInteraction(interaction);

        let transaction = await this.run(interaction);
        await transaction.awaitExecuted(this.provider);
        // This will wait until the transaction is notarized, as well (so that SCRs are returned by the API).
        let transactionOnNetwork = await transaction.getAsOnNetwork(this.provider);
        let bundle = interaction.interpretExecutionResults(transactionOnNetwork);
        return bundle;
    }

    async runQuery(interaction: Interaction, caller?: Address): Promise<QueryResponseBundle> {
        this.checkInteraction(interaction);

        let query = interaction.buildQuery();
        query.caller = caller || this.signer.getAddress();
        let response = await this.provider.queryContract(query);
        let bundle = interaction.interpretQueryResponse(response);
        return bundle;
    }

    async runSimulation(interaction: Interaction): Promise<any> {
        this.checkInteraction(interaction);

        let transaction = interaction.buildTransaction();
        await this.signer.sign(transaction);
        return await transaction.simulate(this.provider);
    }

    private checkInteraction(interaction: Interaction) {
        this.checker.checkInteraction(interaction);
    }
}
