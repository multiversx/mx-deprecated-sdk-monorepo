import { guardTrue, guardValueIsSet } from "../../utils";

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

    getName(): string {
        return this.name;
    }

    getTypeParameters(): BetterType[] {
        return this.typeParameters;
    }

    getFirstTypeParameter(): BetterType {
        guardTrue(this.typeParameters.length > 1, "type parameters length > 1");
        return this.typeParameters[0];
    }

    toString() {
        return this.name;
    }

    equals(type: BetterType): boolean {
        return this.name == type.name;
    }

    valueOf() {
        return this.name;
    }

    /**
     * Inspired from: https://docs.microsoft.com/en-us/dotnet/api/system.type.isassignablefrom
     */
    isAssignableFrom(type: BetterType): boolean {
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

export class PrimitiveType extends BetterType {
    constructor(name: string) {
        super(name);
    }
}

export abstract class CustomType extends BetterType {
}

export abstract class TypedValue {
    private readonly type: BetterType;

    constructor(type: BetterType) {
        this.type = type;
    }

    getType(): BetterType {
        return this.type;
    }

    abstract equals(other: any): boolean;
    abstract valueOf(): any;
}

export abstract class PrimitiveValue extends TypedValue {
}

export function isTyped(value: any) {
    return value instanceof TypedValue;
}

export class TypePlaceholder extends BetterType {
    constructor() {
        super("... ? ...");
    }
}
