import * as errors from "../../errors";
import { Logger } from "../../logger";
import { guardValueIsSet } from "../../utils";
import { AddressType } from "./address";
import { BooleanType } from "./boolean";
import { OptionalType, VectorType } from "./generic";
import { U8Type, I8Type, U16Type, I16Type, BigIntType, BigUIntType, I32Type, U32Type, I64Type, U64Type } from "./numerical";
import { PrimitiveType, Type } from "./types";

export class OldTypesRegistry {
    static Default: OldTypesRegistry = new OldTypesRegistry();

    private readonly typesByName: Map<string, Type> = new Map<string, Type>();

    private constructor() {
        this.typesByName.set("U8", new U8Type());
        this.typesByName.set("I8", new I8Type());
        this.typesByName.set("U16", new U16Type());
        this.typesByName.set("I16", new I16Type());
        this.typesByName.set("U32", new U32Type());
        this.typesByName.set("I32", new I32Type());
        this.typesByName.set("U64", new U64Type());
        this.typesByName.set("I64", new I64Type());
        this.typesByName.set("BigUInt", new BigUIntType());
        this.typesByName.set("BigInt", new BigIntType());

        this.registerType(new Type("Type"));
        this.registerType(new PrimitiveType("PrimitiveType"));

        this.registerType(new BooleanType());
        this.registerType(new AddressType());
        this.registerType(new VectorType());
        this.registerType(new OptionalType());
    }

    registerType(type: Type) {
        guardValueIsSet("type", type);
        guardValueIsSet("type.name", type.name);

        if (this.typesByName.has(type.name)) {
            Logger.debug(`Type already registered: ${type.name}. Will be overridden.`);
        }

        this.typesByName.set(type.name, type);
    }

    resolveType(typeName: string): Type {
        guardValueIsSet("typeName", typeName);

        let type = this.typesByName.get(typeName);
        if (!type) {
            throw new errors.ErrTypingSystem(`Cannot resolve type: ${typeName}`);
        }

        return type;
    }

    findTypes(predicate: (type: Type) => boolean): Type[] {
        let values = Array.from(this.typesByName.values());
        let filtered = values.filter(item => predicate(item));
        return filtered;
    }
}

export class TypesProvider {
    static Default: TypesProvider = new TypesProvider();
    
    private readonly typesByName: Map<string, Type> = new Map<string, Type>();

    private constructor() {
        this.typesByName.set("u8", new U8Type());
        this.typesByName.set("i8", new I8Type());
        this.typesByName.set("u16", new U16Type());
        this.typesByName.set("i16", new I16Type());
        this.typesByName.set("u32", new U32Type());
        this.typesByName.set("i32", new I32Type());
        this.typesByName.set("u64", new U64Type());
        this.typesByName.set("i64", new I64Type());
        this.typesByName.set("BigUint", new BigUIntType());
        this.typesByName.set("Bigint", new BigIntType());

        // TODO: "bool", "Address", "H256", "bytes"
        // TODO: As factories!
        // So that we can have new VectorType(type parameter) -> closed, fully specified generic type
    }

    // get (create) type.
    resolveType(typeName: string): Type {
        guardValueIsSet("typeName", typeName);

        let type = this.typesByName.get(typeName);
        if (!type) {
            throw new errors.ErrTypingSystem(`Cannot resolve type: ${typeName}`);
        }

        return type;
    }
}
