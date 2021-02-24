import { Address } from "../../address";
import { AddressValue } from "./address";
import { BytesValue } from "./bytes";
import { List, ListType, OptionType, OptionValue } from "./generic";
import { BigUIntValue, U8Type, U8Value } from "./numerical";
import { TypedValue, TypePlaceholder } from "./types";

/**
 * Creates a TypedValue, as a missing option argument.
 */
export function missingOption(): TypedValue {
    let type = new OptionType(new TypePlaceholder());
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
export function typedBigInt(value: bigint): TypedValue {
    return new BigUIntValue(value);
}

/**
 * Creates an TypedValue from a number.
 */
export function typedNumber(value: number): TypedValue {
    return typedBigInt(BigInt(value));
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
export function typedUTF8(value: string): TypedValue {
    let buffer = Buffer.from(value, "utf-8");
    let typedBytes = [...buffer].map(byte => new U8Value(byte));
    let type = new ListType(new U8Type());
    return new List(type, typedBytes);
}

export function typedBytesFromHex(value: string) {
    let buffer = Buffer.from(value, "hex");
    return new BytesValue(buffer);
}
