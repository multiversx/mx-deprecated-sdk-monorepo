import { ITypeResolver } from "./interfaces";
import { TypeDescriptor } from "./typeDescriptor";
import { Type } from "./types";

export class TypeResolvers implements ITypeResolver {
    private static instance: TypeResolvers;

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
        throw new Error("Method not implemented.");
    }
}