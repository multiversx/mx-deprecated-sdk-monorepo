import * as errors from "../../errors";
import { Type } from "./types";
import { TypesRegistry } from "./typesRegistry";

/**
 * Handles nested generic types.
 * A nested type parameter is a type parameter that is also a generic type. 
 */
export class TypeDescriptor {
    private readonly scopedTypes: Type[] = [];

    constructor(scopedTypes: Type[]) {
        this.scopedTypes = scopedTypes;
    }

    static createFromTypeNames(scopedTypeNames: string[]): TypeDescriptor {
        let types: Type[] = [];

        for (const typeName of scopedTypeNames) {
            let type = TypesRegistry.resolveType(typeName);
            types.push(type);
        }

        return new TypeDescriptor(types);
    }

    scopeInto(): TypeDescriptor {
        return new TypeDescriptor(this.scopedTypes.slice(1));
    }

    getGenericType(): Type {
        this.assertIsGenericType();
        return this.getOutmostType();
    }

    getOutmostType(): Type {
        return this.scopedTypes[0];
    }

    /**
     * Only one (direct) type parameter is supported (e.g. Map<TKey, TValue> isn't supported). The type parameter can be a generic type, though.
     */
    getTypeParameter(): Type {
        this.assertIsGenericType();
        return this.scopedTypes[1];
    }

    assertIsGenericType() {
        if (!this.isGenericType()) {
            throw new errors.ErrTypingSystem("not a generic type");
        }
    }

    /**
     * Will return `true` for types such as Vector, Optional.
     */
    isGenericType(): boolean {
        return this.scopedTypes.length > 1;
    }

    assertNotVoid() {
        if (this.isVoid()) {
            throw new errors.ErrTypingSystem("void (trivial) type descriptor");
        }
    }

    isVoid() {
        return this.scopedTypes.length == 0;
    }
}
