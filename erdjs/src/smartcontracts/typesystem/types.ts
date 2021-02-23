import { guardTrue, guardValueIsSet } from "../../utils";

/**
 * An abstraction that represents a Type. Handles both generic and non-generic types.
 * Once instantiated as a Type, a generic type is "closed" (as opposed to "open").
 */
export class BetterType {
    private readonly name: string;
    private readonly typeParameters: BetterType[];
    protected readonly cardinality: TypeCardinality;

    public constructor(name: string, typeParameters: BetterType[] = [], cardinality: TypeCardinality = TypeCardinality.fixed(1)) {
        guardValueIsSet("name", name);

        this.name = name;
        this.typeParameters = typeParameters || [];
        this.cardinality = cardinality;
    }

    getName(): string {
        return this.name;
    }

    getTypeParameters(): BetterType[] {
        return this.typeParameters;
    }

    isGenericType(): boolean {
        return this.typeParameters.length > 0;
    }

    getFirstTypeParameter(): BetterType {
        guardTrue(this.typeParameters.length > 0, "type parameters length > 0");
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

    getCardinality(): TypeCardinality {
        return this.cardinality;
    }
}

    /**
 * An abstraction for defining and operating with the cardinality of a (composite or simple) type.
     * 
 * Simple types (the ones that are directly encodable) have a fixed cardinality: [lower = 1, upper = 1].
 * Composite types (not directly encodable) do not follow this constraint. For example:
 *  - VarArgs: [lower = 0, upper = *]
 *  - OptionalResult: [lower = 0, upper = 1]
     */
export class TypeCardinality {
    private readonly lowerBound: number;
    private readonly upperBound?: number;

    private constructor(lowerBound: number, upperBound?: number) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }

    static fixed(value: number): TypeCardinality {
        return new TypeCardinality(value, value);
    }

    static variable(value?: number) {
        return new TypeCardinality(0, value);
    }

    isFixed(): boolean {
        return this.lowerBound == this.upperBound;
    }

    isCountable(): boolean {
        return this.upperBound ? true : false;
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
