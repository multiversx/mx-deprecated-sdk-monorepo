import * as tweetnacl from "tweetnacl";
import { Address } from "../address";
import { guardLength } from "../utils";

export const SEED_LENGTH = 32;

export class UserPrivateKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, SEED_LENGTH);

        this.buffer = buffer;
    }

    static fromString(value: string): UserPrivateKey {
        guardLength(value, SEED_LENGTH * 2);

        let buffer = Buffer.from(value, "hex");
        return new UserPrivateKey(buffer);
    }

    static fromPEM() {
        // todo
    }

    toPEM() {
        // todo
    }

    toPublicKey(): UserPublicKey {
        // TODO: Question for review: @ccorcoveanu, @AdoAdoAdo, as opposed to core-js, here we use "fromSeed" (instead of fromSecretKey, which wouldn't work on 32-byte private keys).
        // TODO: Question for review: is this all right?
        let keyPair = tweetnacl.sign.keyPair.fromSeed(this.buffer);
        let buffer = Buffer.from(keyPair.publicKey);
        return new UserPublicKey(buffer);
    }

    toString(): string {
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

    toString(): string {
        return this.buffer.toString("hex");
    }

    toAddress(): Address {
        return new Address(this.buffer);
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}
