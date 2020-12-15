import { Argument } from "../argument";
import { ContractFunction } from "../function";
import { SmartContract } from "../smartContract";
import { Interaction } from "./interaction";
import { IInteractionRunner } from "./interface";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private readonly runner: IInteractionRunner;
    private preparators: any = {};

    constructor(contract: SmartContract, runner: IInteractionRunner) {
        this.contract = contract;
        this.runner = runner;

        this.setupPreparators();
    }

    private setupPreparators() {
        let self = this;
        let abi = this.contract.getAbi();

        for (const definition of abi.getAllEndpoints()) {
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
