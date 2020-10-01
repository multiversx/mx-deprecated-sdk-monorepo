import * as errors from "./errors";

export const HASH_LENGTH = 32;
export const ADDRESS_LENGTH = 32;
export const SEED_STRING_LENGTH = 64;

export const CODE_HASH_LENGTH = HASH_LENGTH;
export const VMTYPES = ["0500"];

export function VMType(vmType: string): string {
    if (VMTYPES.indexOf(vmType) < 0) {
        throw errors.ErrInvalidVMType;
    }
    return vmType;
}

export function SCCode(code: string): string {
    if (code.length == 0) {
        throw errors.ErrInvalidSmartContractCode;
    }
    return code;
}

export function guardType(name: string, type: any, value?: any, allowUndefined: boolean = true) {
    if (allowUndefined && value === undefined) {
        return;
    }
    if (value instanceof type) {
        return;
    }

    throw new errors.ErrBadType(name, type, value);
}

export function guardValueIsSet(name: string, value?: any | null | undefined) {
    if (value == null || value === undefined) {
        throw new errors.Err(`"${name}" must be set`);
    }
}