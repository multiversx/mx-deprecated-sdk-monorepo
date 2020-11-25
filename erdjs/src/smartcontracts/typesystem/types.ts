import * as errors from "../../errors";

export class Type {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export abstract class PrimitiveType extends Type {
    constructor(name: string) {
        super(name);
    }

    abstract canConvertTo(jsType: string): boolean;

    assertCanConvertTo(jsType: string) {
        if (!this.canConvertTo(jsType)) {
            throw new errors.ErrInvariantFailed(`cannot convert ${this.name} to ${jsType}`);
        }
    }
}

export abstract class TypedValue {
    abstract getType(): Type;
}

export abstract class PrimitiveValue extends TypedValue {
    abstract getValue(): any;
    abstract convertTo(jsType: string): any;
}

export function isTyped(value: any) {
    return value instanceof TypedValue;
}
