import { guardValueIsSet } from "../../utils";
import { EndpointDefinition } from "./endpoint";

/**
 * An Interace represents a (sub)set of endpoints (with their signatures included) defined by a contract.
 */
export class ContractInterface {
    readonly name: string;
    readonly endpoints: EndpointDefinition[] = [];

    constructor(name: string, endpoints: EndpointDefinition[]) {
        this.name = name;
        this.endpoints = endpoints;
    }

    static fromJSON(json: { name: string, endpoints: any[] }): ContractInterface {
        let endpoints = json.endpoints.map(item => EndpointDefinition.fromJSON(item));
        return new ContractInterface(json.name, endpoints);
    }

    findEndpoint(name: string): EndpointDefinition {
        let result = this.endpoints.find(e => e.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
