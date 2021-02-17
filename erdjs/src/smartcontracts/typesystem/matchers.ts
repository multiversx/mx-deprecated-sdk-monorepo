import * as errors from "../../errors";
import { AddressType, AddressValue } from "./address";
import { BooleanType, BooleanValue } from "./boolean";
import { OptionType, OptionValue, List, ListType } from "./generic";
import { NumericalType, NumericalValue } from "./numerical";
import { Struct, StructType } from "./struct";
import { BetterType, PrimitiveType, PrimitiveValue } from "./types";

export function onTypeSelect<TResult>(type: BetterType, selectors: {
    onOption: () => TResult,
    onList: () => TResult,
    onPrimitive: () => TResult,
    onStruct: () => TResult,
    onOther?: () => TResult
}): TResult {
    if (type instanceof OptionType) {
        return selectors.onOption();
    }
    if (type instanceof ListType) {
        return selectors.onList();
    }
    if (type instanceof PrimitiveType) {
        return selectors.onPrimitive();
    }
    if (type instanceof StructType) {
        return selectors.onStruct();
    }

    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`type isn't known: ${type}`);
}

export function onTypedValueSelect<TResult>(value: any, selectors: {
    onPrimitive: () => TResult,
    onOption: () => TResult,
    onList: () => TResult,
    onStruct: () => TResult,
    onOther?: () => TResult
}): TResult {
    if (value instanceof PrimitiveValue) {
        return selectors.onPrimitive();
    }
    if (value instanceof OptionValue) {
        return selectors.onOption();
    }
    if (value instanceof List) {
        return selectors.onList();
    }
    if (value instanceof Struct) {
        return selectors.onStruct();
    }

    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`value isn't typed: ${value}`);
}


export function onPrimitiveValueSelect<TResult>(value: any, selectors: {
    onBoolean: () => TResult,
    onNumerical: () => TResult,
    onAddress: () => TResult,
    onOther?: () => TResult
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

    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`values isn't a primitive: ${value}`);
}

export function onPrimitiveTypeSelect<TResult>(type: PrimitiveType, selectors: {
    onBoolean: () => TResult,
    onNumerical: () => TResult,
    onAddress: () => TResult,
    onOther?: () => TResult
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

    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`type isn't a known primitive: ${type}`);
}
