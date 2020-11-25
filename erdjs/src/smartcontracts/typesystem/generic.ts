import * as errors from "../../errors";
import { isTyped, Type, TypedValue } from "./types";

export class OptionalType extends Type {
    constructor() {
        super("Optional");
    }
}

export class VectorType extends Type {
    constructor() {
        super("Vector");
    }
}

export class OptionalValue {
    private readonly value: any;

    constructor(value: any) {
        if (!isTyped(value)) {
            throw new errors.ErrInvalidArgument("value", value, "cannot be wrapped into an optional");
        }

        this.value = value;
    }

    isSet(): boolean {
        return this.value ? true : false;
    }
}

export class Vector {
    private readonly values: any[];

    constructor(values: any[]) {
        if (values.some(value => !isTyped(value))) {
            throw new errors.ErrInvalidArgument("value", values, "cannot be wrapped into a vector");
        }

        this.values = values;
    }
}