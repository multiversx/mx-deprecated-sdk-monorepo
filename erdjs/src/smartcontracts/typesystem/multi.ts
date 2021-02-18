import { BetterType } from "./types";

/**
 * This is mirroring the VarArgs and MultiResultVec types existing on elrond-wasm's typing system.
 * Applicable to endpoint output arguments.
 */
export class VarArgsType extends BetterType {
    constructor(typeParameter: BetterType) {
        super("VarArgsType", [typeParameter]);
    }
}

/**
 * This is mirroring the MultiArg(N) and MultiResult(N) types existing on elrond-wasm's typing system.
 * Applicable to endpoint output arguments.
 * 
 * Note: this is different from a Tuple (which resembles an anonymous Struct).
 * Question for review: is the above statement correct?
 */
export class CompositeArgType extends BetterType {
    readonly cardinality: number;

    constructor(typeParameters: BetterType[]) {
        super("CompositeArg", typeParameters);
        this.cardinality = typeParameters.length;
    }
}
