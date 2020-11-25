import { TypeDescriptor } from "./typeDescriptor";
import { Type } from "./types";

export interface ITypeResolver {
    resolveTypeDescriptor(scopedTypeNames: string[]): TypeDescriptor;
    resolveType(typeName: string): Type;
}