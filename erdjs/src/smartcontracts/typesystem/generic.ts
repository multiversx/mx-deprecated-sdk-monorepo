import { isTyped, Type, TypedValue } from "./types";

export class OptionalType extends Type {
    static One = new OptionalType();

    private constructor() {
        super("Optional");
    }
}

export class VectorType extends Type {
    static One = new VectorType();

    private constructor() {
        super("Vector");
    }
}

export class OptionalValue extends TypedValue {
    private readonly value: TypedValue | null;

    constructor(value: TypedValue | null = null) {
        super();
        this.value = value;
    }

    isSet(): boolean {
        return this.value ? true : false;
    }

    valueOf(): any {
        return this.value ? this.value.valueOf() : null;
    }

    equals(other: OptionalValue): boolean {
        return this.value?.equals(other.value) || false;
    }

    getType(): Type {
        return OptionalType.One;
    }
}

// TODO: make generic (in TypeScript's sense) or check homogenity.
export class Vector extends TypedValue {
    private readonly items: TypedValue[];

    constructor(items: TypedValue[]) {
        super();
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

    getType(): Type {
        return VectorType.One;
    }
}
