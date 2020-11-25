import * as errors from "../../errors";
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
    private readonly value: any;

    constructor(value: any) {
        super();

        if (!isTyped(value)) {
            throw new errors.ErrInvalidArgument("value", value, "cannot be wrapped into an optional");
        }

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
    private readonly values: any[];

    constructor(values: any[]) {
        super();

        if (values.some(value => !isTyped(value))) {
            throw new errors.ErrInvalidArgument("value", values, "cannot be wrapped into a vector");
        }

        this.values = values;
    }

    getType(): Type {
        return VectorType.One;
    }
}