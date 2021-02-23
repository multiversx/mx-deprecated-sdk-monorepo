import { BetterType, TypeCardinality } from "./types";

export class VarArgsType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("VarArgs", [typeParameter], TypeCardinality.variable());
    }
}

export class MultiResultVecType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("MultiResultVec", [typeParameter], TypeCardinality.variable());
    }
}

export class OptionalArgType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("OptionalArg", [typeParameter], TypeCardinality.variable(1));
    }
}

export class OptionalResultType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("OptionalResult", [typeParameter], TypeCardinality.variable(1));
    }
}

export class MultiArgType extends BetterType {
    constructor(...typeParameters: BetterType[]) {
        super("MultiArg", typeParameters, TypeCardinality.variable(typeParameters.length));
    }
}

export class MultiResultType extends BetterType {
    constructor(...typeParameters: BetterType[]) {
        super("MultiResult", typeParameters, TypeCardinality.variable(typeParameters.length));
    }
}
