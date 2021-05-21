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

        let constructorDefinition = constructorFromJSON(json);
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

function constructorFromJSON(json: any): EndpointDefinition | null {
    // if the JSON "constructor" field is missing
    if (json.constructor == Object.constructor) {
        return null;
    }
    // the name will be missing, so we add it manually
    let constructorWithName = { name: "constructor", ...json.constructor };

    return EndpointDefinition.fromJSON(constructorWithName);
}
