import { guardValueIsSet } from "../../utils";
import { BetterType, isTyped, TypedValue } from "./types";

export class OptionalType extends BetterType {
    constructor() {
        super("Optional");
    }
}

export class VectorType extends BetterType {
    constructor() {
        super("Vector");
    }
}

export class OptionalValue extends TypedValue {
    private readonly value: TypedValue | null;

    constructor(type: BetterType, value: TypedValue | null = null) {
        super(type);

        // TODO: assert has one type parameter
        // TODO: assert value is of type parameter

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

export class Vector extends TypedValue {
    private readonly items: TypedValue[];

    constructor(type: BetterType, items: TypedValue[]) {
        super(type);

        // TODO: assert has one type parameter
        // TODO: assert items are of type parameter

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

    equals(other: Vector): boolean {
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
