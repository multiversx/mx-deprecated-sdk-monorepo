import { Balance } from "../balance";
import { ISigner } from "../interface";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { SmartContractAbi } from "./abi";
import { ContractFunction } from "./function";
import { IGasEstimator } from "./interface";
import { SmartContract } from "./smartContract";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private readonly abi: SmartContractAbi;
    private readonly gasEstimator: IGasEstimator;
    private readonly signer: ISigner;
    private interogators: any = {};
    private preparators: any = {};
    private runners: any = {};

    constructor(contract: SmartContract, abi: SmartContractAbi, gasEstimator: IGasEstimator, signer: ISigner) {
        this.contract = contract;
        this.abi = abi;
        this.gasEstimator = gasEstimator;
        this.signer = signer;

        this.setupInterogators();
        this.setupPreparators();
        this.setupRunners();
    }

    private setupInterogators() {
        let self = this;

        for (const definition of this.abi.getAllFunctions()) {
            let functionName = definition.name;

            this.preparators[functionName] = function() {
            };
        }
    }

    private setupPreparators() {
        let self = this;

        for (const definition of this.abi.getAllFunctions()) {
            let functionName = definition.name;

            this.preparators[functionName] = function() {
                self.executePreparator(functionName, [...arguments]);
            };
        }
    }

    private setupRunners() {
        // TODO: for each ... in ABI
    }

    query(): any {
        return this.interogators;
    }

    prepare(): any {
        return this.preparators;
    }

    run(): any {
        return this.runners;
    }

    private executePreparator(functionName: string, _args: any[]): Transaction {
        let transaction = this.contract.call({
            func: new ContractFunction(functionName),
            gasLimit: new GasLimit(10000000),
            args: [],
            value: Balance.Zero()
        });

        transaction.onSigned.on(this.onTransactionSigned.bind(this));

        return transaction;
    }

    private onTransactionSigned() {
        // TODO: increment copy of nonce
    }

    private executeRunner() {
        // TODO: Delegates to preparators
        // TODO: Requires signer.
    }
}
