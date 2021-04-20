import * as errors from "../errors";
import { UserSecretKey, USER_PUBKEY_LENGTH, USER_SEED_LENGTH } from "./userKeys";
import { ValidatorSecretKey, VALIDATOR_SECRETKEY_LENGTH } from "./validatorKeys";

export function parseUserKey(text: string, index: number = 0): UserSecretKey {
    let keys = parseUserKeys(text);
    return keys[index];
}

export function parseUserKeys(text: string): UserSecretKey[] {
    // The user PEM files encode both the seed and the pubkey in their payloads.
    let buffers = parse(text, USER_SEED_LENGTH + USER_PUBKEY_LENGTH);
    return buffers.map(buffer => new UserSecretKey(buffer.slice(0, USER_SEED_LENGTH)));
}

export function parseValidatorKey(text: string, index: number = 0): ValidatorSecretKey {
    let keys = parseValidatorKeys(text);
    return keys[index];
}

export function parseValidatorKeys(text: string): ValidatorSecretKey[] {
    let buffers = parse(text, VALIDATOR_SECRETKEY_LENGTH);
    return buffers.map(buffer => new ValidatorSecretKey(buffer));
}

export function parse(text: string, expectedLength: number): Buffer[] {
    // Split by newlines, trim whitespace, then discard remaining empty lines.
    let lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    let buffers: Buffer[] = [];
    let linesAccumulator: string[] = [];

    for (const line of lines) {
        if (line.startsWith("-----BEGIN")) {
            linesAccumulator = [];
        } else if (line.startsWith("-----END")) {
            let asBase64 = linesAccumulator.join("");
            let asHex = Buffer.from(asBase64, "base64").toString();
            let asBytes = Buffer.from(asHex, "hex");

            if (asBytes.length != expectedLength) {
                throw new errors.ErrBadPEM("incorrect key length");
            }

            buffers.push(asBytes);
            linesAccumulator = [];
        } else {
            linesAccumulator.push(line);
        }
    }

    if (linesAccumulator.length != 0) {
        throw new errors.ErrBadPEM("incorrect file structure");
    }

    return buffers;
}
