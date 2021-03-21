import { BigUIntType, BooleanType } from "../typesystem";
import { BinaryCodec } from "./binary";

const Codec = new BinaryCodec();

export function decodeUnsignedNumber(buffer: Buffer): number {
    let value = Codec.decodeTopLevel(buffer, new BigUIntType());
    let raw = Number(value.valueOf());
    return raw;
}

export function decodeBool(buffer: Buffer): boolean {
    let value = Codec.decodeTopLevel(buffer, new BooleanType());
    let raw = Boolean(value.valueOf());
    return raw;
}
