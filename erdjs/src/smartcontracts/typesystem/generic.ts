import { guardValueIsSet } from "../../utils";
import { BetterType, isTyped, TypedValue } from "./types";

export class OptionType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("Option", [typeParameter]);
    }
}

export class ListType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("List", [typeParameter]);
    }
}

export class OptionValue extends TypedValue {
    private readonly value: TypedValue | null;

    constructor(type: OptionType, value: TypedValue | null = null) {
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

    equals(other: OptionValue): boolean {
        return this.value?.equals(other.value) || false;
    }
}

// TODO: Rename to ListValue, for consistency (though the term is slighly unfortunate).
export class List extends TypedValue {
    private readonly items: TypedValue[];

    /**
     * 
     * @param type the type of this TypedValue (an instance of ListType), not the type parameter of the ListType
     * @param items the items, having the type type.getFirstTypeParameter()
     */
    constructor(type: ListType, items: TypedValue[]) {
        super(type);

        // TODO: assert items are of type type.getFirstTypeParameter()

        this.items = items;
    }

    getLength(): number {
        return this.items.length;
    }

    getItems(): ReadonlyArray<TypedValue> {
        return this.items;
    }

    valueOf(): any[] {
        return this.items.map(item => item.valueOf());
    }

    equals(other: List): boolean {
        if (this.getLength() != other.getLength()) {
            return false;
        }

        for (let i = 0; i < this.getLength(); i++) {
            let selfItem = this.items[i];
            let otherItem = other.items[i];

            if (!selfItem.equals(otherItem)) {
                return false;
            }
        }

        return true;
    }
}
