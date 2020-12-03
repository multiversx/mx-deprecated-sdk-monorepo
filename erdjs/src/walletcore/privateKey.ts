import * as errors from "../errors";
import * as tweetnacl from "tweetnacl";
import { guardLength } from "../utils";
import {PublicKey} from "./publicKey";

export class PrivateKey {
    private readonly buffer: Buffer;
    
    constructor(buffer: Buffer) {
        guardLength(buffer, 32);
        
        this.buffer = buffer;
    }

    static fromString(value: string): PrivateKey {
        guardLength(value, 64);

        let buffer = Buffer.from(value, "hex");
        return new PrivateKey(buffer);
    }

    static fromKeyFileObject() {

    }

    static fromPEM() {
    }

    toPEM() {
    }

    toPublicKey(): PublicKey {
        // TODO: Question for review: @ccorcoveanu, @AdoAdoAdo, here we use "fromSeed" (instead of fromSecretKey, which wouldn't work on 32-byte private keys).
        // TODO: Question for review: is this all right?
        let keyPair = tweetnacl.sign.keyPair.fromSeed(this.buffer);
        let buffer = Buffer.from(keyPair.publicKey);
        return new PublicKey(buffer);
    }

    toString(): string {
        return this.buffer.toString("hex");
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}
