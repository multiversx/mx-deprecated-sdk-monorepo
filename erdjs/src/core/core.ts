import * as bech32 from "bech32";
import { ADDRESS_LENGTH, ADDRESS_PREFIX } from "./data/validation";
import * as errors from "./data/errors";

export function erdAddressToBytes(address: string): Buffer {
    let decodedAddress = bech32.decode(address);
    if (decodedAddress.prefix != ADDRESS_PREFIX) {
        throw errors.ErrInvalidAddressPrefix;
    }

    let addressBytes = Buffer.from(bech32.fromWords(decodedAddress.words));
    if (addressBytes.length != ADDRESS_LENGTH) {
        throw errors.ErrWrongAddressLength;
    }
    return addressBytes;
}

export function erdAddressFromBytes(bytes: Buffer): string {
    if (bytes.length != ADDRESS_LENGTH) {
        throw errors.ErrWrongAddressLength;
    }

    let words = bech32.toWords(bytes);
    let address = bech32.encode(ADDRESS_PREFIX, words);
    return address;
}

export function erdAddressToHex(address: string): string {
    let addressBytes = erdAddressToBytes(address);
    let addressHex = addressBytes.toString('hex');

    return addressHex
}

export function erdAddressFromHex(addressHex: string): string {
    let addressBytes = Buffer.from(addressHex, 'hex');
    let address = erdAddressFromBytes(addressBytes);

    return address;
}
