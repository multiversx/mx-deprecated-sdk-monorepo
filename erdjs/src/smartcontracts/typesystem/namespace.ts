import { FunctionDefinition } from "./function";
import { StructureDefinition } from "./structure";

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
}
