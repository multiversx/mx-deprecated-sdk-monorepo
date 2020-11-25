import { Namespace } from "./namespace";
import { StructureType } from "./structure";
import { TypesRegistry } from "./typesRegistry";

/**
 * Contract ABIs aren't yet fully implemented. This is just a prototype.
 * A future release of `erdjs` will handle ABIs properly.
 */
export class AbiRegistry {
    readonly namespaces: Namespace[] = [];

    extend(json: any) {
        for (let item of json.namespaces || []) {
            this.namespaces.push(new Namespace(item));
        }

        this.registerStructures();
    }

    private registerStructures() {
        for (const namespace of this.namespaces) {
            for (const definition of namespace.structures) {
                let type = new StructureType(definition);
                TypesRegistry.registerType(type);
            }
        }
    }
}

