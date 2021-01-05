import { guardValueIsSet } from "../../utils";

export class Type {
    readonly name: string;

    constructor(name: string) {
        guardValueIsSet("name", name);

        this.name = name;
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

/**
 * An abstraction that represents a Type. Handles both generic and non-generic types.
 * Once instantiated as a Type, a generic type is "closed" (as opposed to "open").
 */
export class BetterType {
    private readonly name: string;
    private readonly typeParameters: BetterType[];

    public constructor(name: string, typeParameters: BetterType[] = []) {
        guardValueIsSet("name", name);

        this.name = name;
        this.typeParameters = typeParameters || [];
    }

    getTypeParameters(): BetterType[] {
        return this.typeParameters;
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

    /**
     * Converts the account to a pretty, plain JavaScript object.
     */
    toJSON(): any {
        return {
            name: this.name,
            typeParameters: this.typeParameters.map(item => item.toJSON())
        };
    }
}

export class PrimitiveType extends Type {
    constructor(name: string) {
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
