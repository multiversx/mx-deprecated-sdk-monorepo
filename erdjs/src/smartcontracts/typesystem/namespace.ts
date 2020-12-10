import { guardValueIsSet } from "../../utils";
import { Endpoint } from "./endpoint";
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
    readonly endpoints: Endpoint[] = [];
    readonly structures: StructureDefinition[] = [];

    constructor(namespace: string, endpoints: Endpoint[], structures: StructureDefinition[]) {
        this.namespace = namespace;
        this.endpoints = endpoints;
        this.structures = structures;
    }

    static fromJSON(json: { namespace: string, endpoints: any[], structures: any[] }): Namespace {
        let endpoints = (json.endpoints || []).map(item => Endpoint.fromJSON(item));
        let structures = (json.structures || []).map(item => StructureDefinition.fromJSON(item));
        return new Namespace(json.namespace, endpoints, structures);
    }

    findEndpoint(name: string): Endpoint {
        let result = this.endpoints.find(e => e.name == name);
        guardValueIsSet("result", result);
        return result!;
    }

    findEndpoints(names: string[]): Endpoint[] {
        return names.map(name => this.findEndpoint(name));
    }
}
