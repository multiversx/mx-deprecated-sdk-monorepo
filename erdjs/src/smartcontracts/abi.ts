import { guardValueIsSet } from "../utils";
import { AbiRegistry, EndpointDefinition, Namespace } from "./typesystem";
import { ContractInterface } from "./typesystem/contractInterface";

export class SmartContractAbi {
    private readonly uses: Namespace[] = [];
    private readonly implements: ContractInterface[] = [];

    constructor(registry: AbiRegistry, usesNamespaces: string[], implementsInterfaces: string[]) {
        this.uses = registry.findNamespaces(usesNamespaces);

        for (const namespace of this.uses) {
            this.implements.push(...namespace.findInterfaces(implementsInterfaces));
        }
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
