import { guardTrue, guardValueIsSet } from "../../utils";

/**
 * An abstraction that represents a Type. Handles both generic and non-generic types.
 * Once instantiated as a Type, a generic type is "closed" (as opposed to "open").
 */
export class Type {
    private readonly name: string;
    private readonly typeParameters: Type[];
    protected readonly cardinality: TypeCardinality;

    public constructor(name: string, typeParameters: Type[] = [], cardinality: TypeCardinality = TypeCardinality.fixed(1)) {
        guardValueIsSet("name", name);

        this.name = name;
        this.typeParameters = typeParameters;
        this.cardinality = cardinality;
    }

    getName(): string {
        return this.name;
    }

    getTypeParameters(): Type[] {
        return this.typeParameters;
    }

    isGenericType(): boolean {
        return this.typeParameters.length > 0;
    }

    getFirstTypeParameter(): Type {
        guardTrue(this.typeParameters.length > 0, "type parameters length > 0");
        return this.typeParameters[0];
    }


    /**
     * Generates type expressions similar to elrond-wasm-rs. 
     * Involves recursive calls to toString().
     */
    toString() {
        let typeParameters: string = this.getTypeParameters().map(type => type.toString()).join(", ");
        let typeParametersExpression = typeParameters ? `<${typeParameters}>` : "";
        return `${this.name}${typeParametersExpression}`;
    }

    equals(other: Type): boolean {
        return Type.equals(this, other);
    }

    static equals(a: Type, b: Type): boolean {
        // Workaround that seems to always work properly. Most probable reasons: 
        // - ES6 is quite strict about enumerating over the properties on an object.
        // - toJSON() returns an object literal (most probably, this results in deterministic iteration in all browser implementations).
        let aJson = JSON.stringify(a.toJSON());
        let bJson = JSON.stringify(b.toJSON());

        return aJson == bJson;
    }

    static equalsMany(a: Type[], b: Type[]) {
        return a.every((type: Type, i: number) => type.equals(b[i]));
    }

    static isAssignableFromMany(a: Type[], b: Type[]) {
        return a.every((type: Type, i: number) => type.isAssignableFrom(b[i]));
    }

    differs(other: Type): boolean {
        return !this.equals(other);
    }

    valueOf() {
        return this.name;
    }

    /**
     * Inspired from: https://docs.microsoft.com/en-us/dotnet/api/system.type.isassignablefrom
     * For (most) generics, type invariance is expected (assumed) - neither covariance, nor contravariance are supported yet (will be supported in a next release).
     * 
     * One exception though: for {@link OptionType}, we simulate covariance for missing (not provided) values.
     * For example, Option<u32> is assignable from Option<?>.
     * For more details, see the implementation of {@link OptionType}.
     * 
     * Also see:
     *  - https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
     *  - https://docs.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance
     */
    isAssignableFrom(type: Type): boolean {
        let invariantTypeParameters = Type.equalsMany(this.getTypeParameters(), type.getTypeParameters());
        return type instanceof this.constructor && invariantTypeParameters;
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

    // Question for review: though nice and might help us in the future, this concept (assigning a fixed or variable value-cardinality to each type) 
    // isn't extremly useful at this moment (except for some checks in the codecs - e.g. "only types with <singular> cardinality are directly encodable" - non-composite, non-variadic).
    // Keep it or remove it?
    getCardinality(): TypeCardinality {
        return this.cardinality;
    }
}

/**
 * TODO: Simplify this class, keep only what is needed.
 * 
 * An abstraction for defining and operating with the cardinality of a (composite or simple) type.
 * 
 * Simple types (the ones that are directly encodable) have a fixed cardinality: [lower = 1, upper = 1].
 * Composite types (not directly encodable) do not follow this constraint. For example:
 *  - VarArgs: [lower = 0, upper = *]
 *  - OptionalResult: [lower = 0, upper = 1]
 */
export class TypeCardinality {
    /**
     * An arbitrarily chosen, reasonably large number.
     */
    private static MaxCardinality: number = 4096;

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

    isSingular(): boolean {
        return this.lowerBound == 1 && this.upperBound == 1;
    }

    isSingularOrNone(): boolean {
        return this.lowerBound == 0 && this.upperBound == 1;
    }

    isComposite(): boolean {
        return !this.isSingular();
    }

    isFixed(): boolean {
        return this.lowerBound == this.upperBound;
    }

    getLowerBound(): number {
        return this.lowerBound;
    }

    getUpperBound(): number {
        return this.upperBound || TypeCardinality.MaxCardinality;
    }
}

export class PrimitiveType extends Type {
    constructor(name: string) {
        super(name);
    }
}

export abstract class CustomType extends Type {
}

export abstract class TypedValue {
    private readonly type: Type;

    constructor(type: Type) {
        this.type = type;
    }

    getType(): Type {
        return this.type;
    }

    abstract equals(other: any): boolean;
    abstract valueOf(): any;
}

export abstract class PrimitiveValue extends TypedValue {
    constructor(type: Type) {
        super(type);
    }
}

export function isTyped(value: any) {
    return value instanceof TypedValue;
}

export class TypePlaceholder extends Type {
    constructor() {
        super("...");
    }
}


export class NullType extends Type {
    constructor() {
        super("?");
    }
}
