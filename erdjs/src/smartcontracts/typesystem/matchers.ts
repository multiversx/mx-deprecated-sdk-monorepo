import { AddressType, AddressValue } from "./address";
import { BooleanType, BooleanValue } from "./boolean";
import { OptionalValue, Vector } from "./generic";
import { NumericalType, NumericalValue } from "./numerical";
import { PrimitiveType, PrimitiveValue } from "./types";

export function onPrimitiveValueSelect<TResult>(value: any, selectors: {
    onBoolean: () => TResult,
    onNumerical: () => TResult,
    onAddress: () => TResult,
    onOther: () => TResult
}): TResult {
    if (value instanceof BooleanValue) {
        return selectors.onBoolean();
    }
    if (value instanceof NumericalValue) {
        return selectors.onNumerical();
    }
    if (value instanceof AddressValue) {
        return selectors.onAddress();
    }

    return selectors.onOther();
}

export function onPrimitiveTypeSelect<TResult>(type: PrimitiveType, selectors: {
    onBoolean: () => TResult,
    onNumerical: () => TResult,
    onAddress: () => TResult,
    onOther: () => TResult
}): TResult {
    if (type instanceof BooleanType) {
        return selectors.onBoolean();
    }
    if (type instanceof NumericalType) {
        return selectors.onNumerical();
    }
    if (type instanceof AddressType) {
        return selectors.onAddress();
    }

    return selectors.onOther();
}

export function onTypedValueSelect<TResult>(value: any, selectors: {
    onPrimitive: () => TResult,
    onOptional: () => TResult,
    onVector: () => TResult,
    onCustom: () => TResult,
    onOther: () => TResult
}): TResult {
    if (value instanceof PrimitiveValue) {
        return selectors.onPrimitive();
    }
    if (value instanceof OptionalValue) {
        return selectors.onOptional();
    }
    if (value instanceof Vector) {
        return selectors.onVector();
    }

    // TODO: onCustom.

    return selectors.onOther();
}