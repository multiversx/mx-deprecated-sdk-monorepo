import { ErrInvariantFailed } from "../../errors";
import { guardValueIsSet } from "../../utils";
import { EndpointDefinition } from "./endpoint";

const NamePlaceholder = "?";

/**
 * An Interace represents a (sub)set of endpoints (with their signatures included) defined by a contract.
 */
export class ContractInterface {
    readonly name: string;
    readonly constructorDefinition: EndpointDefinition | null;
    readonly endpoints: EndpointDefinition[] = [];

    constructor(name: string, constructor_definition: EndpointDefinition | null, endpoints: EndpointDefinition[]) {
        this.name = name;
        this.constructorDefinition = constructor_definition;
        this.endpoints = endpoints;
    }

    static fromJSON(json: { name: string, constructor: any, endpoints: any[] }): ContractInterface {
        json.name = json.name || NamePlaceholder;
        json.endpoints = json.endpoints || [];

        // because the JSON field is named "constructor", when it's missing json.constructor contains Object.constructor, which is a Function
        let constructorDefinition = !(json.constructor instanceof Function) ? EndpointDefinition.fromJSON(json.constructor) : null;
        let endpoints = json.endpoints.map(item => EndpointDefinition.fromJSON(item));
        return new ContractInterface(json.name, constructorDefinition, endpoints);
    }

    getConstructorDefinition(): EndpointDefinition | null {
        return this.constructorDefinition;
    }

    getEndpoint(name: string): EndpointDefinition {
        let result = this.endpoints.find(e => e.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
