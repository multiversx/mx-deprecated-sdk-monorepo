import { guardValueIsSet } from "../../utils";
import { Type, TypeCardinality, TypedValue } from "./types";

export class VariadicType extends Type {
    constructor(typeParameter: Type) {
        super("Variadic", [typeParameter], TypeCardinality.variable());
    }
}

/**
 * For simpler design, we chose not to subclass {@link VariadicType}, but create a different type instead for optionals,
 * even though an optional is conceptually variadic: it holds zero or one values.
 */
export class OptionalType extends Type {
    constructor(typeParameter: Type) {
        super("Optional", [typeParameter], TypeCardinality.variable(1));
    }
}

/**
 * An abstraction that represents a sequence of values held under the umbrella of a variadic input / output parameter.
 * 
 * Since at the time of constructing input parameters or decoding output parameters, the length is known, 
 * this TypedValue behaves similar to a List.
 */
export class VariadicValue extends TypedValue {
    private readonly items: TypedValue[];

    /**
     * 
     * @param type the type of this TypedValue (an instance of VariadicType), not the type parameter of the VariadicType
     * @param items the items, having the type type.getFirstTypeParameter()
     */
    constructor(type: VariadicType, items: TypedValue[]) {
        super(type);

        // TODO: assert items are of type type.getFirstTypeParameter()

        this.items = items;
    }

    getItems(): ReadonlyArray<TypedValue> {
        return this.items;
    }

    valueOf(): any[] {
        return this.items.map(item => item.valueOf());
    }

    equals(other: VariadicValue): boolean {
        if (this.getType().differs(other.getType())) {
            return false;
        }

        for (let i = 0; i < this.items.length; i++) {
            let selfItem = this.items[i];
            let otherItem = other.items[i];

            if (!selfItem.equals(otherItem)) {
                return false;
            }
        }

        return true;
    }
}


export class OptionalValue extends TypedValue {
    private readonly value: TypedValue | null;

    constructor(type: OptionalType, value: TypedValue | null = null) {
        super(type);

        // TODO: assert value is of type type.getFirstTypeParameter()

        this.value = value;
    }

    isSet(): boolean {
        return this.value ? true : false;
    }

    getTypedValue(): TypedValue {
        guardValueIsSet("value", this.value);
        return this.value!;
    }

    valueOf(): any {
        return this.value ? this.value.valueOf() : null;
    }

    equals(other: OptionalValue): boolean {
        return this.value?.equals(other.value) || false;
    }
}
