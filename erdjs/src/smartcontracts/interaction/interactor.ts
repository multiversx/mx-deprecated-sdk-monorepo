import { ContractFunction } from "../function";
import { SmartContract } from "../smartContract";
import { Interaction } from "./interaction";
import { TypedValue } from "../typesystem";

export class SmartContractInteractor {
    private readonly contract: SmartContract;
    private preparators: any = {};

    constructor(contract: SmartContract) {
        this.contract = contract;

        this.setupPreparators();
    }

    // TODO: Add suport for init() (deploy).
    private setupPreparators() {
        let self = this;
        let abi = this.contract.getAbi();

        for (const definition of abi.getAllEndpoints()) {
            let functionName = definition.name;

            this.preparators[functionName] = function (args: TypedValue[]) {
                return self.doPrepare(functionName, args || []);
            };
        }
    }

    prepare(): any {
        return this.preparators;
    }

    private doPrepare(functionName: string, args: TypedValue[]): Interaction {
        let func = new ContractFunction(functionName);
        let interaction = new Interaction(this.contract, func, args);
        return interaction;
    }
}
