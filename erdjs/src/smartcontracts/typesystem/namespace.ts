import { guardValueIsSet } from "../../utils";
import { FunctionDefinition } from "./function";
import { StructureDefinition } from "./structure";

/**
 * A namespace contains ABI definitions (function signatures and structure layouts) for one or more Smart Contracts.
 * In the simplest case, a namespace contains ABI definitions for a single contract.
 * 
 * For components reused across multiple contracts - say, framework-level base classes or commonly-used structures, 
 * a namespace serves as a way to capture the commonality (for the purpose of reducing duplication within ABI definitions).
 */
export class Namespace {
    readonly namespace: string;
    readonly functions: FunctionDefinition[] = [];
    readonly structures: StructureDefinition[] = [];

    constructor(namespace: string, functions: FunctionDefinition[], structures: StructureDefinition[]) {
        this.namespace = namespace;
        this.functions = functions;
        this.structures = structures;
    }

    static fromJSON(json: { namespace: string, functions: any[], structures: any[] }): Namespace {
        let functions = json.functions.map(item => FunctionDefinition.fromJSON(item));
        let structures = json.structures.map(item => StructureDefinition.fromJSON(item));
        return new Namespace(json.namespace, functions, structures);
    }

    findFunction(functionName: string): FunctionDefinition {
        let result = this.functions.find(e => e.name == functionName);
        guardValueIsSet("result", result);
        return result!;
    }
}
