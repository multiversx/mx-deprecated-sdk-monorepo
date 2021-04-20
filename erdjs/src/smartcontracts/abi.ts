import { ErrInvariantFailed } from "../errors";
import { guardLength, guardValueIsSet } from "../utils";
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

    getConstructorDefinition(): EndpointDefinition {
        let constructors = [];
        for (const iface of this.interfaces) {
            let constructor_definition = iface.getConstructorDefinition();
            if (constructor_definition != null) {
                constructors.push(constructor_definition);
            }
        }
        if (constructors.length != 1) {
            throw new ErrInvariantFailed(`Expected 1 constructor in smart contract abi (found ${constructors.length})`);
        }
        return constructors[0];
    }

    getEndpoint(name: string): EndpointDefinition {
        let result = this.getAllEndpoints().find(item => item.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
