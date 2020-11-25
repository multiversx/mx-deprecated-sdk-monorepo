import { Type } from "./types";

export interface ITypeResolver {
    resolveType(typeName: string): Type | null;
}