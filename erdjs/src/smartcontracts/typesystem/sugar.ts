import { Address } from "../../address";
import { AddressValue } from "./address";
import { BytesValue } from "./bytes";
import { OptionType, OptionValue } from "./generic";
import { BigUIntValue } from "./numerical";
import { NullType, TypedValue } from "./types";

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
export function typedUTF8(value: string): BytesValue {
    let buffer = Buffer.from(value, "utf-8");
    return new BytesValue(buffer);
}

export function typedBytesFromHex(value: string): BytesValue {
    let buffer = Buffer.from(value, "hex");
    return new BytesValue(buffer);
}
