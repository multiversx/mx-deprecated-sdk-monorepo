import { guardValueIsSet } from "../../utils";
import { TypesRegistry } from "./typesRegistry";

export abstract class Type {
    readonly name: string;

    constructor(name: string) {
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
}

export abstract class PrimitiveType extends Type {
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
