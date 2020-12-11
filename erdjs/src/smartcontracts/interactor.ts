import { Address } from "../address";
import { Balance } from "../balance";
import { IProvider, ISigner } from "../interface";
import { GasLimit } from "../networkParams";
import { NonceTracker } from "../nonce";
import { Transaction, TransactionHash } from "../transaction";
import { SmartContractAbi } from "./abi";
import { ContractFunction } from "./function";
import { IInteractionRunner } from "./interface";
import { Query, QueryResponse } from "./query";
import { SmartContract } from "./smartContract";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private readonly abi: SmartContractAbi;
    private readonly runner: IInteractionRunner;
    private preparators: any = {};

    constructor(contract: SmartContract, abi: SmartContractAbi, runner: IInteractionRunner) {
        this.contract = contract;
        this.abi = abi;
        this.runner = runner;

        this.setupPreparators();
    }

    private setupPreparators() {
        let self = this;

        for (const definition of this.abi.getAllFunctions()) {
            let functionName = definition.name;

            this.preparators[functionName] = function () {
                self.doPrepare(functionName, [...arguments]);
            };
        }
    }

    prepare(): any {
        return this.preparators;
    }

    private doPrepare(functionName: string, _args: any[]): PreparedInteraction {
        let contractFunction = new ContractFunction(functionName);
        // TODO: Use gasEstimator.
        let gasLimit = new GasLimit(10000000);

        let transaction = this.contract.call({
            func: contractFunction,
            gasLimit: gasLimit,
            args: [],
            // Value will be set using "PreparedInteraction.withValue()".
            value: Balance.Zero()
        });

        let query = new Query({
            address: this.contract.getAddress(),
            func: contractFunction,
            args: [],
            // Value will be set using "PreparedInteraction.withValue()".
            value: Balance.Zero(),
            // Caller will be set by the InteractionRunner.
            caller: new Address()
        });

        return new PreparedInteraction(this.runner, transaction, query);
    }
}

/**
 * Interactions are mutable (the interaction runner mutates their content: transaction, query).
 * But they aren't really reusable, therfore their mutability should not cause erroneous usage (generally speaking).
 */
export class PreparedInteraction {
    readonly runner: IInteractionRunner;
    readonly transaction: Transaction;
    readonly query: Query;

    constructor(runner: IInteractionRunner, transaction: Transaction, query: Query) {
        this.runner = runner;
        this.transaction = transaction;
        this.query = query;
    }

    async runBroadcast(): Promise<TransactionHash> {
        return this.runner.runBroadcast(this);
    }

    async runQuery(): Promise<QueryResponse> {
        return this.runner.runQuery(this)
    }

    async runSimulate(): Promise<any> {
        return this.runner.runSimulate(this);
    }

    withValue(value: Balance): PreparedInteraction {
        this.transaction.value = value;
        this.query.value = value;

        return this;
    }

    withGasLimit(gasLimit: GasLimit): PreparedInteraction {
        this.transaction.gasLimit = gasLimit;

        return this;
    }
}

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

export class WebInteractionRunner implements IInteractionRunner {
    // TODO: Use WalletProvider. No ProxyProvider.

    runBroadcast(_interaction: PreparedInteraction): Promise<TransactionHash> {
        throw new Error("Method not implemented.");
    }

    runQuery(_interaction: PreparedInteraction): Promise<QueryResponse> {
        throw new Error("Method not implemented.");
    }

    runSimulate(_interaction: PreparedInteraction): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
