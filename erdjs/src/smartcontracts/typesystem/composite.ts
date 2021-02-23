import { guardLength } from "../../utils";
import { BetterType, TypeCardinality, TypedValue } from "./types";

export class CompositeType extends BetterType {
    constructor(...typeParameters: BetterType[]) {
        super("Composite", typeParameters, TypeCardinality.variable(typeParameters.length));
    }
}

export class CompositeValue extends TypedValue {
    private readonly items: TypedValue[];

    constructor(type: CompositeType, items: TypedValue[]) {
        super(type);

        guardLength(items, type.getTypeParameters().length);

        // TODO: assert type of each item (wrt. type.getTypeParameters()).

        this.items = items;
    }

    getItems(): ReadonlyArray<TypedValue> {
        return this.items;
    }

    valueOf(): any[] {
        return this.items.map(item => item.valueOf());
    }

    equals(other: CompositeValue): boolean {
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
