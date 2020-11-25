import { AddressType } from "./address";
import { BooleanType } from "./boolean";
import { OptionalType, VectorType } from "./generic";
import { ITypeResolver } from "./interfaces";
import { TypeDescriptor } from "./typeDescriptor";
import { Type } from "./types";

export class TypeResolvers implements ITypeResolver {
    private static instance: TypeResolvers;
    private readonly resolvers: ITypeResolver[] = [];

    /**
     * Gets the singleton.
     */
    static get(): TypeResolvers {
        if (!TypeResolvers.instance) {
            TypeResolvers.instance = new TypeResolvers();
        }

        return TypeResolvers.instance;
    }

    addResolver(resolver: ITypeResolver) {
        this.resolvers.push(resolver);
    }

    clearResolvers() {
        this.resolvers.splice(0, this.resolvers.length);
    }

    resolveTypeDescriptor(scopedTypeNames: string[]): TypeDescriptor {
        let types: Type[] = [];

        for (const typeName of scopedTypeNames) {
            let type = this.resolveType(typeName);
            types.push(type);
        }

        return new TypeDescriptor(types);
    }
    
    resolveType(typeName: string): Type {
        // TODO:
        if (typeName == "Optional") {
            return new OptionalType();
        }
        if (typeName == "Vector") {
            return new VectorType();
        }
        if (typeName == "Boolean") {
            return new BooleanType();
        }
        if (typeName == "Address") {
            return new AddressType();
        }
    }
}