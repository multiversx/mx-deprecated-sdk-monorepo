import { ITypeResolver } from "./interfaces";
import { Namespace } from "./namespace";
import { StructureType } from "./structure";
import { Type } from "./types";

/**
 * Contract ABIs aren't yet fully implemented. This is just a prototype.
 * A future release of `erdjs` will handle ABIs properly.
 */
export class AbiRegistry implements ITypeResolver {
    readonly namespaces: Namespace[] = [];

    extend(json: any) {
        for (let item of json.namespaces || []) {
            this.namespaces.push(new Namespace(item));
        }
    }

    /**
     * Resolves a typeName to a custom structure type (user-defined).
     * Will not resolve primitive types, nor generics.
     * 
     * @param typeName the typeName to be resolved to a Type
     */
    resolveType(typeName: string): Type | null {
        for (const namespace of this.namespaces) {
            let definition = namespace.structures.find(item => item.name == typeName);
            if (definition) {
                return new StructureType(definition);
            }
        }

        return null;
    }
}

