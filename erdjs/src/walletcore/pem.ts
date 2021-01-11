import { UserPrivateKey } from "./userKeys";
import { ValidatorPrivateKey } from "./validatorKeys";

export function parseUserKey(text: string, index: number = 0): UserPrivateKey {
    let keys = parseUserKeys(text);
    let key = keys[index];
    return key;
}

export function parseUserKeys(text: string): UserPrivateKey[] {
    let buffers = parse(text);
    let keys = buffers.map(buffer => new UserPrivateKey(buffer.slice(0, 32)));
    return keys;
}

export function parseValidatorKey(text: string, index: number = 0): ValidatorPrivateKey {
    let keys = parseValidatorKeys(text);
    let key = keys[index];
    return key;
}

export function parseValidatorKeys(text: string): ValidatorPrivateKey[] {
    let buffers = parse(text);
    let keys = buffers.map(buffer => new ValidatorPrivateKey(buffer));
    return keys;
}

function parse(text: string): Buffer[] {
    let lines = text.split(/\r?\n/);
    let buffers: Buffer[] = [];
    let linesAccumulator: string[] = [];

    for (const line of lines) {
        if (line.startsWith("-----BEGIN")) {
            linesAccumulator = [];
        } else if (line.startsWith("-----END")) {
            let asBase64 = linesAccumulator.join("");
            let asHex = Buffer.from(asBase64, "base64").toString();
            let asBytes = Buffer.from(asHex, "hex");
            buffers.push(asBytes);
        } else {
            linesAccumulator.push(line);
        }
    }

    return buffers;
}
