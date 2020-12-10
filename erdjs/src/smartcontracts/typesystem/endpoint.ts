import { guardValueIsSet } from "../../utils";
import { FunctionDefinition } from "./function";

/**
 * An Endpoint (or Trait, or Interface) represents a (sub)set of functions (with their signatures included) defined by a contract.
 */
export class Endpoint {
    readonly name: string;
    readonly functions: FunctionDefinition[] = [];

    constructor(name: string, functions: FunctionDefinition[]) {
        this.name = name;
        this.functions = functions;
    }

    static fromJSON(json: { name: string, functions: any[] }): Endpoint {
        let functions = json.functions.map(item => FunctionDefinition.fromJSON(item));
        return new Endpoint(json.name, functions);
    }

    findFunction(functionName: string): FunctionDefinition {
        let result = this.functions.find(e => e.name == functionName);
        guardValueIsSet("result", result);
        return result!;
    }
}
