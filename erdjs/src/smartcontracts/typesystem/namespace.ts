import { FunctionDefinition } from "./function";
import { StructureDefinition } from "./structure";

export class Namespace {
    readonly namespace: string;
    readonly functions: FunctionDefinition[] = [];
    readonly structures: StructureDefinition[] = [];

    constructor(init: { namespace: string, functions: any[], structures: any[] }) {
        this.namespace = init.namespace;

        for (let item of init.functions || []) {
            this.functions.push(new FunctionDefinition(item));
        }

        for (let item of init.structures || []) {
            this.structures.push(new StructureDefinition(item));
        }
    }
}
