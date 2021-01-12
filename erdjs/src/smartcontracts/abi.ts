import { guardValueIsSet } from "../utils";
import { AbiRegistry, EndpointDefinition } from "./typesystem";
import { ContractInterface } from "./typesystem/contractInterface";

export class SmartContractAbi {
    private readonly implements: ContractInterface[] = [];

    constructor(registry: AbiRegistry, implementsInterfaces: string[]) {
        this.implements.push(...registry.findInterfaces(implementsInterfaces));
    }

    getAllEndpoints(): EndpointDefinition[] {
        let endpoints = [];
        
        for (const iface of this.implements) {
            endpoints.push(...iface.endpoints);
        }

        return endpoints;
    }

    findEndpoint(name: string): EndpointDefinition {
        let result = this.getAllEndpoints().find(item => item.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
