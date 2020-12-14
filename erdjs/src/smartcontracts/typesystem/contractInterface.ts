import { guardValueIsSet } from "../../utils";
import { FunctionDefinition } from "./function";

/**
 * An Interace represents a (sub)set of endpoints (with their signatures included) defined by a contract.
 */
export class ContractInterface {
    readonly name: string;
    readonly functions: FunctionDefinition[] = [];

    constructor(name: string, functions: FunctionDefinition[]) {
        this.name = name;
        this.functions = functions;
    }

    static fromJSON(json: { name: string, functions: any[] }): ContractInterface {
        let functions = json.functions.map(item => FunctionDefinition.fromJSON(item));
        return new ContractInterface(json.name, functions);
    }

    findFunction(functionName: string): FunctionDefinition {
        let result = this.functions.find(e => e.name == functionName);
        guardValueIsSet("result", result);
        return result!;
    }
}
