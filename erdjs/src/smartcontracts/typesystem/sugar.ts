import { Address } from "../../address";
import { AddressValue } from "./address";
import { BytesValue } from "./bytes";
import { List, OptionType, OptionValue } from "./generic";
import { BigUIntValue } from "./numerical";
import { NullType, TypedValue, TypePlaceholder } from "./types";
import BigNumber from "bignumber.js";
import { CompositeType, CompositeValue } from "./composite";
import { VariadicType, VariadicValue } from "./variadic";

/**
 * Creates a TypedValue, as a missing option argument.
 */
export function missingOption(): TypedValue {
    let type = new OptionType(new NullType());
    return new OptionValue(type);
}

/**
 * Creates a TypedValue, as a provided option argument.
 */
export function providedOption(typedValue: TypedValue): TypedValue {
    let type = new OptionType(typedValue.getType());
    return new OptionValue(type, typedValue);
}

/**
 * Creates an TypedValue from a big integer.
 */
export function typedBigInt(value: BigNumber): TypedValue {
    return new BigUIntValue(value);
}

/**
 * Creates an TypedValue from a number.
 */
export function typedNumber(value: number): TypedValue {
    return typedBigInt(new BigNumber(value));
}

/**
 * Creates an TypedValue object, as the pubkey of an {@link Address}.
 */
export function typedAddress(value: Address): TypedValue {
    return new AddressValue(value);
}

/**
 * Creates an TypedValue from a utf-8 string.
 */
export function typedUTF8(value: string): BytesValue {
    let buffer = Buffer.from(value, "utf-8");
    return new BytesValue(buffer);
}

export function typedBytesFromHex(value: string): BytesValue {
    let buffer = Buffer.from(value, "hex");
    return new BytesValue(buffer);
}

export function typedComposite(...values: TypedValue[]): CompositeValue {
    let typeParameters = values.map(value => value.getType());
    let type = new CompositeType(...typeParameters);
    return new CompositeValue(type, values);
}

export function typedList(items: TypedValue[]): List {
    if (items.length == 0) {
        return new List(new TypePlaceholder(), []);
    }
    
    let typeParameter = items[0].getType();
    return new List(typeParameter, items);
}

export function typedVariadic(...values: TypedValue[]): VariadicValue {
    if (values.length == 0) {
        return new VariadicValue(new VariadicType(new TypePlaceholder()), []);
    }

    let typeParameter = values[0].getType();
    return new VariadicValue(new VariadicType(typeParameter), values);
}
