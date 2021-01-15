import { UserSecretKey } from "./userKeys";
import { ValidatorSecretKey } from "./validatorKeys";

export function parseUserKey(text: string, index: number = 0): UserSecretKey {
    let keys = parseUserKeys(text);
    return keys[index];
}

export function parseUserKeys(text: string): UserSecretKey[] {
    let buffers = parse(text);
    return buffers.map(buffer => new UserSecretKey(buffer.slice(0, 32)));
}

export function parseValidatorKey(text: string, index: number = 0): ValidatorSecretKey {
    let keys = parseValidatorKeys(text);
    return keys[index];
}

export function parseValidatorKeys(text: string): ValidatorSecretKey[] {
    let buffers = parse(text);
    return buffers.map(buffer => new ValidatorSecretKey(buffer));
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
