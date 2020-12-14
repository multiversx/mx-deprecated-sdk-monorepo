import { Address } from "../../address";
import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { SmartContractAbi } from "../abi";
import { Argument } from "../argument";
import { ContractFunction } from "../function";
import { Query } from "../query";
import { SmartContract } from "../smartContract";
import { IInteractionChecker, IInteractionRunner } from "./interface";
import { PreparedInteraction } from "./preparedInteraction";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private readonly abi: SmartContractAbi;
    private readonly checker: IInteractionChecker;
    private readonly runner: IInteractionRunner;
    private preparators: any = {};

    constructor(contract: SmartContract, abi: SmartContractAbi, checker: IInteractionChecker, runner: IInteractionRunner) {
        this.contract = contract;
        this.abi = abi;
        this.checker = checker;
        this.runner = runner;

        this.setupPreparators();
    }

    private setupPreparators() {
        let self = this;

        for (const definition of this.abi.getAllEndpoints()) {
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
        let func = new ContractFunction(functionName);

        let transaction = this.contract.call({
            func: func,
            // GasLimit will be set using "PreparedInteraction.withGasLimit()".
            gasLimit: GasLimit.min(),
            args: args,
            // Value will be set using "PreparedInteraction.withValue()".
            value: Balance.Zero()
        });

        let query = new Query({
            address: this.contract.getAddress(),
            func: func,
            args: args,
            // Value will be set using "PreparedInteraction.withValue()".
            value: Balance.Zero(),
            // Caller will be set by the InteractionRunner.
            caller: new Address()
        });

        let interaction = new PreparedInteraction(func, this.checker, this.runner, transaction, query);
        return interaction;
    }
}
