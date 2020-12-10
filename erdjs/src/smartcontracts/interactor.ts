import { Address } from "../address";
import { Balance } from "../balance";
import { IProvider, ISigner } from "../interface";
import { GasLimit } from "../networkParams";
import { Transaction, TransactionHash } from "../transaction";
import { SmartContractAbi } from "./abi";
import { ContractFunction } from "./function";
import { IGasEstimator, IInteractorRunner as IInteractionRunner } from "./interface";
import { Query, QueryResponse } from "./query";
import { SmartContract } from "./smartContract";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private readonly abi: SmartContractAbi;
    private readonly gasEstimator: IGasEstimator;
    private readonly runner: IInteractionRunner;
    private preparators: any = {};

    constructor(contract: SmartContract, abi: SmartContractAbi, gasEstimator: IGasEstimator, runner: IInteractionRunner) {
        this.contract = contract;
        this.abi = abi;
        this.gasEstimator = gasEstimator;
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
}

export class DefaultInteractionRunner implements IInteractionRunner {
    private readonly signer: ISigner;
    private readonly provider: IProvider;

    constructor(signer: ISigner, provider: IProvider) {
        this.signer = signer;
        this.provider = provider;
    }

    async runBroadcast(_interaction: PreparedInteraction): Promise<TransactionHash> {
        // TODO manages nonces as well.
        // transaction.onSigned.on(this.onTransactionSigned.bind(this));
        throw new Error("not implemented")
    }

    private onTransactionSigned() {
        // TODO: increment copy of nonce
    }

    async runQuery(_interaction: PreparedInteraction): Promise<QueryResponse> {
        // should also set caller here. Maybe receive as param (to override)?
        throw new Error("not implemented")
    }

    async runSimulate(interaction: PreparedInteraction): Promise<any> {

        // must have good nonce ...
        await interaction.transaction.simulate(this.provider);

        // simulateOne.setNonce(alice.nonce);
        // simulateTwo.setNonce(alice.nonce);

        // await aliceSigner.sign(simulateOne);
    }
}

export class WebInteractionRunner implements IInteractionRunner {
    
}
