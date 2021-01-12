import * as tweetnacl from "tweetnacl";
import { Address } from "../address";
import { guardLength } from "../utils";
import { parseUserKey } from "./pem";

export const SEED_LENGTH = 32;

export class UserSecretKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, SEED_LENGTH);

        this.buffer = buffer;
    }

    static fromString(value: string): UserSecretKey {
        guardLength(value, SEED_LENGTH * 2);

        let buffer = Buffer.from(value, "hex");
        return new UserSecretKey(buffer);
    }

    static fromPem(text: string, index: number = 0): UserSecretKey {
        return parseUserKey(text, index);
    }

    toPublicKey(): UserPublicKey {
        // TODO: Question for review: @ccorcoveanu, @AdoAdoAdo, as opposed to core-js, here we use "fromSeed" (instead of fromSecretKey, which wouldn't work on 32-byte private keys).
        // TODO: Question for review: is this all right?
        let keyPair = tweetnacl.sign.keyPair.fromSeed(this.buffer);
        let buffer = Buffer.from(keyPair.publicKey);
        return new UserPublicKey(buffer);
    }

    sign(message: Buffer): Buffer {
        let pair = tweetnacl.sign.keyPair.fromSeed(this.buffer);
        let signingKey = pair.secretKey;
        let signature = tweetnacl.sign(new Uint8Array(message), signingKey);
        signature = signature.slice(0, signature.length - message.length);

        return Buffer.from(signature);
    }

    hex(): string {
        return this.buffer.toString("hex");
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}

export class UserPublicKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, 32);
        
        this.buffer = buffer;
    }

    hex(): string {
        return this.buffer.toString("hex");
    }

    toAddress(): Address {
        return new Address(this.buffer);
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}
