import * as errors from "./errors";

// TODO: Create a class called "Guard". Add the following as member functions.

export function guardTrue(value: boolean, what: string) {
    if (!value) {
        throw new errors.ErrInvariantFailed(`[<${what}>] isn't true`);
    }
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

// TODO: merge with guardValueIsSetWithMessage
export function guardValueIsSet(name: string, value?: any | null | undefined) {
    guardValueIsSetWithMessage(`${name} isn't set (null or undefined)`, value);
}

// TODO: merge with guardValueIsSet
export function guardValueIsSetWithMessage(message: string, value?: any | null | undefined) {
    if (value == null || value === undefined) {
        throw new errors.ErrInvariantFailed(message);
    }
}

export function guardSameLength(a: any[], b: any[]) {
    a = a || [];
    b = b || [];

    if (a.length != b.length) {
        throw new errors.ErrInvariantFailed("arrays do not have the same length");
    }
}

export function guardLength(withLength: { length?: number }, expectedLength: number) {
    let actualLength = withLength.length || 0;

    if (actualLength != expectedLength) {
        throw new errors.ErrInvariantFailed(`wrong length, expected: ${expectedLength}, actual: ${actualLength}`);
    }
}

export function guardNotEmpty(value: { isEmpty?: () => boolean, length?: number }, what: string) {
    if (isEmpty(value)) {
        throw new errors.ErrInvariantFailed(`${what} is empty`);
    }
}

export function guardEmpty(value: { isEmpty?: () => boolean, length?: number }, what: string) {
    if (!isEmpty(value)) {
        throw new errors.ErrInvariantFailed(`${what} is not empty`);
    }
}

export function isEmpty(value: { isEmpty?: () => boolean, length?: number }): boolean {
    if (value.isEmpty) {
        return value.isEmpty();
    }

    return value.length === 0;
}
