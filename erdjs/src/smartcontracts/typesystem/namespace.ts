import { guardValueIsSet } from "../../utils";
import { ContractInterface } from "./contractInterface";
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
    readonly interfaces: ContractInterface[] = [];
    readonly structures: StructureDefinition[] = [];

    constructor(namespace: string, interfaces: ContractInterface[], structures: StructureDefinition[]) {
        this.namespace = namespace;
        this.interfaces = interfaces;
        this.structures = structures;
    }

    static fromJSON(json: { namespace: string, interfaces: any[], structures: any[] }): Namespace {
        let interfaces = (json.interfaces || []).map(item => ContractInterface.fromJSON(item));
        let structures = (json.structures || []).map(item => StructureDefinition.fromJSON(item));
        return new Namespace(json.namespace, interfaces, structures);
    }

    findInterface(name: string): ContractInterface {
        let result = this.interfaces.find(e => e.name == name);
        guardValueIsSet("result", result);
        return result!;
    }

    findInterfaces(names: string[]): ContractInterface[] {
        return names.map(name => this.findInterface(name));
    }
}
