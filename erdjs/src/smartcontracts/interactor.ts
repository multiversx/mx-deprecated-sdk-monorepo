import { Balance } from "../balance";
import { ISigner } from "../interface";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { ContractFunction } from "./function";
import { IGasEstimator } from "./interface";
import { SmartContract } from "./smartContract";
import { AbiRegistry } from "./typesystem";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private readonly abi: AbiRegistry;
    private readonly gasEstimator: IGasEstimator;
    private readonly signer: ISigner;
    private preparators: any = {};
    private runners: any = {};

    constructor(contract: SmartContract, abi: AbiRegistry, gasEstimator: IGasEstimator, signer: ISigner) {
        this.contract = contract;
        this.abi = abi;
        this.gasEstimator = gasEstimator;
        this.signer = signer;

        this.setupPreparators();
        this.setupRunners();
    }

    private setupPreparators() {
        // TODO: for each ... in ABI
    }

    private setupRunners() {
        // TODO: for each ... in ABI
    }

    prepare(): any {
        return this.preparators;
    }

    run(): any {
        return this.runners;
    }

    private executePreparator(): Transaction {
        let transaction = this.contract.call({
            func: new ContractFunction("foobar"),
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
