import * as errors from "../../errors";
import { Logger } from "../../logger";
import { AddressType } from "./address";
import { BooleanType } from "./boolean";
import { BytesType } from "./bytes";
import { CompositeType } from "./composite";
import { EnumType } from "./enum";
import { ListType, OptionType } from "./generic";
import { H256Type } from "./h256";
import { BigIntType, BigUIntType, I16Type, I32Type, I64Type, I8Type, U16Type, U32Type, U64Type, U8Type } from "./numerical";
import { StructFieldDefinition, StructType } from "./struct";
import { BetterType } from "./types";
import { OptionalType, VariadicType } from "./variadic";

type TypeConstructor = new (...typeParameters: BetterType[]) => BetterType;

/**
 * This list contains all known types, including generic ones and non-encodable ones - with the exception of custom types (enums and structs).
 */
const KnownTypes: TypeConstructor[] = [
    U8Type, U16Type, U32Type, U64Type, BigUIntType, I8Type, I16Type, I32Type, I64Type, BigIntType, 
    BooleanType, BytesType, AddressType, H256Type, 
    OptionType, ListType,
];

export class TypeMapper {
    private readonly knownTypesMap: Map<string, TypeConstructor>;

    constructor() {
        this.knownTypesMap = new Map<string, TypeConstructor>();

        for (const knownType of KnownTypes) {
            let name = new knownType().getName();
            this.knownTypesMap.set(name, knownType);
        }

        // We use a slightly different typing than the one defined by elrond-wasm-rs (temporary workaround).
        this.knownTypesMap.set("VarArgs", VariadicType);
        this.knownTypesMap.set("MultiResultVec", VariadicType);
        this.knownTypesMap.set("OptionalArg", OptionalType);
        this.knownTypesMap.set("OptionalResult", OptionalType);
        this.knownTypesMap.set("MultiArg", CompositeType);
        this.knownTypesMap.set("MultiResult", CompositeType);
    }

    mapType(type: BetterType): BetterType {
        let isGeneric = type.isGenericType();

        if (type instanceof EnumType) {
            return type;
        }

        if (type instanceof StructType) {
            return this.mapStructType(type);
        }

        if (!this.isKnown(type)) {
            Logger.warn(`Unknown type: ${type}. Won't be mapped.`);
            return type;
        }

        if (isGeneric) {
            return this.mapGenericType(type);
        }

        let constructor = this.getKnown(type);
        return new constructor();
    }

    private mapStructType(type: StructType): StructType {
        let mappedFields = type.fields.map(item => new StructFieldDefinition(item.name, item.description, this.mapType(item.type)));
        let mappedStruct = new StructType(type.getName(), mappedFields);
        return mappedStruct;
    }

    private mapGenericType(type: BetterType): BetterType {
        let typeParameters = type.getTypeParameters();
        let mappedTypeParameters = typeParameters.map(item => this.mapType(item));
        let constructor = this.getKnown(type);
        return new constructor(...mappedTypeParameters);
    }

    private isKnown(type: BetterType): boolean {
        return this.knownTypesMap.has(type.getName());
    }

    private getKnown(type: BetterType): TypeConstructor {
        let constructor = this.knownTypesMap.get(type.getName());
        return constructor!;
    }
}
