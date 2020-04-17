import * as errors from "./errors";

export const HASH_LENGTH = 32;
export const ADDRESS_LENGTH = 32;
export const CODE_HASH_LENGTH = HASH_LENGTH;
export const ADDRESS_PREFIX = "erd";

export function Address(address: string): string {
    if (address.length != ADDRESS_LENGTH) {
        // TODO throw errors.ErrWrongAddressLength;
    }
    return address;
}

export function Nonce(nonce: number): number {
    if (nonce < 0) {
        throw errors.ErrNegativeNonce;
    }
    return nonce;
}

export function BalanceString(balance: string): bigint {
    if (balance.length == 0) {
        throw errors.ErrInvalidBalanceString;
    }
    let balanceValue = BigInt(balance);
    if (balanceValue < 0) {
        throw errors.ErrNegativeBalance;
    }
    return balanceValue;
}

export function CodeHash(hash: string | null): string {
    if (hash == null) {
        hash = "";
    }
    if (hash === "") {
        return hash;
    }
    if (hash.length != CODE_HASH_LENGTH) {
        throw errors.ErrInvalidCodeHash;
    }
    // TODO check if the code hash is a real blake2b hash (if there are
    // criteria to check, apart from length)
    return hash;
}

export function Code(code: string | null, expectedCodeHash: string): string {
    if (code == null) {
        code = "";
    }
    if (code === "" && expectedCodeHash === "") {
        return code;
    }
    
    let codeHash = makeCodeHash(code);
    if (codeHash !== expectedCodeHash) {
        // TODO throw errors.ErrCodeHasUnexpectedHash;
    }
    return code;
}

export function RootHash(hash: string | null): string {
    if (hash == null) {
        hash = "";
    }
    if (hash === "") {
        return hash;
    }
    if (hash.length != CODE_HASH_LENGTH) {
        throw errors.ErrInvalidRootHash;
    }
    // TODO check if the root hash is a real blake2b hash (if there are
    // criteria to check, apart from length)
    return hash;
}

function makeCodeHash(code: string) {
    return "not_a_hash";
}
