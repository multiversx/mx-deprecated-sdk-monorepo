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

    getType(): Type {
        return OptionalType.One;
    }
}

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

    getType(): Type {
        return VectorType.One;
    }
}