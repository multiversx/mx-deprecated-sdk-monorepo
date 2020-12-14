import { guardValueIsSet } from "../utils";
import { AbiRegistry, FunctionDefinition, Namespace } from "./typesystem";
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

    getAllFunctions(): FunctionDefinition[] {
        let functions = [];
        
        for (const iface of this.implements) {
            functions.push(...iface.functions);
        }

        return functions;
    }

    findFunction(name: string): FunctionDefinition {
        let result = this.getAllFunctions().find(item => item.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}
