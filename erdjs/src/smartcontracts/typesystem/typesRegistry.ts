import * as errors from "../../errors";
import { guardValueIsSet } from "../../utils";
import { Type } from "./types";

export class TypesRegistry {
    private static typesByName: Map<string, Type> = new Map<string, Type>();

    static registerType(type: Type) {
        guardValueIsSet("type", type);
        guardValueIsSet("type.name", type.name);

        if (TypesRegistry.typesByName.has(type.name)) {
            throw new errors.ErrTypingSystem(`Type already registered: ${type.name}`);
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
}