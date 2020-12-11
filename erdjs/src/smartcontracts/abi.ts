import { guardValueIsSet } from "../utils";
import { AbiRegistry, FunctionDefinition, Namespace } from "./typesystem";
import { Endpoint } from "./typesystem/endpoint";

export class SmartContractAbi {
    private readonly uses: Namespace[] = [];
    private readonly implements: Endpoint[] = [];

    constructor(registry: AbiRegistry, usesNamespaces: string[], implementsEndpoints: string[]) {
        this.uses = registry.findNamespaces(usesNamespaces);

        for (const namespace of this.uses) {
            this.implements.push(...namespace.findEndpoints(implementsEndpoints));
        }
    }

    getAllFunctions(): FunctionDefinition[] {
        let functions = [];
        
        for (const endpoint of this.implements) {
            functions.push(...endpoint.functions);
        }

        return functions;
    }

    findFunction(name: string): FunctionDefinition {
        let result = this.getAllFunctions().find(item => item.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
