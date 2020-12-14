import { SmartContractAbi } from "../abi";
import { Argument } from "../argument";
import { ContractFunction } from "../function";
import { SmartContract } from "../smartContract";
import { Interaction } from "./interaction";
import { IInteractionRunner } from "./interface";

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

        for (const definition of this.abi.getAllEndpoints()) {
            let functionName = definition.name;

            this.preparators[functionName] = function (args: Argument[]) {
                return self.doPrepare(functionName, args || []);
            };
        }
    }

    prepare(): any {
        return this.preparators;
    }

    private doPrepare(functionName: string, args: Argument[]): Interaction {
        let func = new ContractFunction(functionName);
        let interaction = new Interaction(this.contract, func, args, this.runner);
        return interaction;
    }
}
