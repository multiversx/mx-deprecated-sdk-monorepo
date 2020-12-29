import * as errors from "../../errors";
import { Logger } from "../../logger";
import { guardValueIsSet } from "../../utils";
import { Type } from "./types";

// TODO: Refactor, so that type registry isn't global / singleton anymore.
export class TypesRegistry {
    private static typesByName: Map<string, Type> = new Map<string, Type>();

    static registerType(type: Type) {
        guardValueIsSet("type", type);
        guardValueIsSet("type.name", type.name);

        if (TypesRegistry.typesByName.has(type.name)) {
            Logger.debug(`Type already registered: ${type.name}. Will be overridden.`);
        }

        TypesRegistry.typesByName.set(type.name, type);
    }

    static resolveType(typeName: string): Type {
        guardValueIsSet("typeName", typeName);

        let type = TypesRegistry.typesByName.get(typeName);
        if (!type) {
            throw new errors.ErrTypingSystem(`Cannot resolve type: ${typeName}`);
        }

        return type;
    }

    static findTypes(predicate: (type: Type) => boolean): Type[] {
        let values = Array.from(TypesRegistry.typesByName.values());
        let filtered = values.filter(item => predicate(item));
        return filtered;
    }
}
