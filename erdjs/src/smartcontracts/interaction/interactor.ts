import { Address } from "../../address";
import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { SmartContractAbi } from "../abi";
import { Argument } from "../argument";
import { ContractFunction } from "../function";
import { Query } from "../query";
import { SmartContract } from "../smartContract";
import { IInteractionRunner } from "./interface";
import { PreparedInteraction } from "./preparedInteraction";

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

            this.preparators[functionName] = function (args: Argument[]) {
                self.doPrepare(functionName, args || []);
            };
        }
    }

    prepare(): any {
        return this.preparators;
    }

    private doPrepare(functionName: string, args: Argument[]): PreparedInteraction {
        let contractFunction = new ContractFunction(functionName);

        let transaction = this.contract.call({
            func: contractFunction,
            // GasLimit will be set using "PreparedInteraction.withGasLimit()".
            gasLimit: GasLimit.min(),
            args: args,
            // Value will be set using "PreparedInteraction.withValue()".
            value: Balance.Zero()
        });

        let query = new Query({
            address: this.contract.getAddress(),
            func: contractFunction,
            args: args,
            // Value will be set using "PreparedInteraction.withValue()".
            value: Balance.Zero(),
            // Caller will be set by the InteractionRunner.
            caller: new Address()
        });

        return new PreparedInteraction(this.runner, transaction, query);
    }
}
