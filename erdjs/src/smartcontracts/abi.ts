import { guardValueIsSet } from "../utils";
import { AbiRegistry, EndpointDefinition } from "./typesystem";
import { ContractInterface } from "./typesystem/contractInterface";

export class SmartContractAbi {
    private readonly interfaces: ContractInterface[] = [];

    constructor(registry: AbiRegistry, implementsInterfaces: string[]) {
        this.interfaces.push(...registry.getInterfaces(implementsInterfaces));
    }

    getAllEndpoints(): EndpointDefinition[] {
        let endpoints = [];
        
        for (const iface of this.interfaces) {
            endpoints.push(...iface.endpoints);
        }

        return endpoints;
    }

    getEndpoint(name: string): EndpointDefinition {
        let result = this.getAllEndpoints().find(item => item.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
