import { Type, TypeCardinality, TypedValue, TypePlaceholder } from "./types";

export class VariadicType extends Type {
    constructor(typeParameter: Type) {
        super("Variadic", [typeParameter], TypeCardinality.variable());
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

    static fromItems(...items: TypedValue[]): VariadicValue {
        if (items.length == 0) {
            return new VariadicValue(new VariadicType(new TypePlaceholder()), []);
        }
    
        let typeParameter = items[0].getType();
        return new VariadicValue(new VariadicType(typeParameter), items);
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
