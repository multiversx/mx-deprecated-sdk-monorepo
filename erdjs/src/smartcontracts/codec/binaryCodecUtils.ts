import BigNumber from "bignumber.js";
import { BigUIntType, BooleanType, BytesType } from "../typesystem";
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

export function decodeString(buffer: Buffer): string {
    let value = Codec.decodeTopLevel(buffer, new BytesType());
    let raw = String(value.valueOf());
    return raw;
}

export function decodeBigNumber(buffer: Buffer): BigNumber {
    let value = Codec.decodeTopLevel(buffer, new BigUIntType());
    let raw = new BigNumber(value.valueOf());
    return raw;
}
