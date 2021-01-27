import { guardValueIsSet } from "../../utils";
import { Namespace } from "./namespace";
import { StructureType } from "./structure";

/**
 * Contract ABIs aren't yet fully implemented. This is just a prototype.
 * A future release of `erdjs` will handle ABIs properly.
 */
export class AbiRegistry {
    readonly namespaces: Namespace[] = [];

    extend(json: any) {
        for (let item of json.namespaces || []) {
            this.namespaces.push(Namespace.fromJSON(item));
        }

        this.registerStructures();
    }

    private registerStructures() {
        for (const namespace of this.namespaces) {
            for (const definition of namespace.structures) {
                new StructureType(definition);
            }
        }
    }

    findNamespace(namespace: string): Namespace {
        let result = this.namespaces.find(e => e.namespace == namespace);
        guardValueIsSet("result", result);
        return result!;
    }
}
