import { guardValueIsSet } from "../../utils";
import { TypesRegistry } from "./typesRegistry";

export class Type {
    static One = new Type("Type");

    readonly name: string;

    protected constructor(name: string) {
        guardValueIsSet("name", name);

        this.name = name;
        TypesRegistry.registerType(this);
    }

    toString() {
        return this.name;
    }

    equals(type: Type): boolean {
        return this.name == type.name;
    }

    valueOf() {
        return this.name;
    }

    /**
     * Inspired from: https://docs.microsoft.com/en-us/dotnet/api/system.type.isassignablefrom
     */
    isAssignableFrom(type: Type): boolean {
        return type instanceof this.constructor;
    }
}

export class PrimitiveType extends Type {
    static One = new PrimitiveType("PrimitiveType");

    protected constructor(name: string) {
        super(name);
    }
}

export abstract class TypedValue {
    abstract getType(): Type;
    abstract equals(other: any): boolean;
    abstract valueOf(): any;
}

export abstract class PrimitiveValue extends TypedValue {
}

export function isTyped(value: any) {
    return value instanceof TypedValue;
}
