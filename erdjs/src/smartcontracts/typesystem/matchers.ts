import * as errors from "../../errors";
import { AddressType, AddressValue } from "./address";
import { BooleanType, BooleanValue } from "./boolean";
import { BytesType, BytesValue } from "./bytes";
import { EnumType, EnumValue } from "./enum";
import { OptionType, OptionValue, List, ListType } from "./generic";
import { H256Type, H256Value } from "./h256";
import { NumericalType, NumericalValue } from "./numerical";
import { Struct, StructType } from "./struct";
import { TokenIdentifierType, TokenIdentifierValue } from "./tokenIdentifier";
import { Tuple, TupleType } from "./tuple";
import { Type, PrimitiveType, PrimitiveValue } from "./types";

// TODO: Extend functionality or rename wrt. restricted / reduced functionality (not all types are handled: composite, variadic).
export function onTypeSelect<TResult>(
    type: Type,
    selectors: {
        onOption: () => TResult;
        onList: () => TResult;
        onPrimitive: () => TResult;
        onStruct: () => TResult;
        onTuple: () => TResult;
        onEnum: () => TResult;
        onOther?: () => TResult;
    }
): TResult {
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
    if (type instanceof TupleType) {
        return selectors.onTuple();
    }
    if (type instanceof EnumType) {
        return selectors.onEnum();
    }

    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`type isn't known: ${type}`);
}

export function onTypedValueSelect<TResult>(
    value: any,
    selectors: {
        onPrimitive: () => TResult;
        onOption: () => TResult;
        onList: () => TResult;
        onStruct: () => TResult;
        onTuple: () => TResult;
        onEnum: () => TResult;
        onOther?: () => TResult;
    }
): TResult {
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
    if (value instanceof Tuple) {
        return selectors.onTuple();
    }
    if (value instanceof EnumValue) {
        return selectors.onEnum();
    }
    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`value isn't typed: ${value}`);
}

export function onPrimitiveValueSelect<TResult>(
    value: PrimitiveValue,
    selectors: {
        onBoolean: () => TResult;
        onNumerical: () => TResult;
        onAddress: () => TResult;
        onBytes: () => TResult;
        onH256: () => TResult;
        onTypeIdentifier: () => TResult;
        onOther?: () => TResult;
    }
): TResult {
    if (value instanceof BooleanValue) {
        return selectors.onBoolean();
    }
    if (value instanceof NumericalValue) {
        return selectors.onNumerical();
    }
    if (value instanceof AddressValue) {
        return selectors.onAddress();
    }
    if (value instanceof BytesValue) {
        return selectors.onBytes();
    }
    if (value instanceof H256Value) {
        return selectors.onH256();
    }
    if (value instanceof TokenIdentifierValue) {
        return selectors.onTypeIdentifier();
    }
    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`value isn't a primitive: ${value.getType()}`);
}

export function onPrimitiveTypeSelect<TResult>(
    type: PrimitiveType,
    selectors: {
        onBoolean: () => TResult;
        onNumerical: () => TResult;
        onAddress: () => TResult;
        onBytes: () => TResult;
        onH256: () => TResult;
        onTokenIndetifier: () => TResult;
        onOther?: () => TResult;
    }
): TResult {
    if (type instanceof BooleanType) {
        return selectors.onBoolean();
    }
    if (type instanceof NumericalType) {
        return selectors.onNumerical();
    }
    if (type instanceof AddressType) {
        return selectors.onAddress();
    }
    if (type instanceof BytesType) {
        return selectors.onBytes();
    }
    if (type instanceof H256Type) {
        return selectors.onH256();
    }
    if (type instanceof TokenIdentifierType) {
        return selectors.onTokenIndetifier();
    }
    if (selectors.onOther) {
        return selectors.onOther();
    }

    throw new errors.ErrTypingSystem(`type isn't a known primitive: ${type}`);
}
