import * as errors from "../errors";
import * as tweetnacl from "tweetnacl";
import { guardLength } from "../utils";
import { PublicKey } from "./publicKey";
import nacl from "tweetnacl";
const crypto = require("crypto");
const uuid = require("uuid/v4");
const scryptsy = require("scryptsy");

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

    /**
     * WIP! This PR is not ready for review yet!
     * 
     * Copied from: https://github.com/ElrondNetwork/elrond-core-js/blob/v1.28.0/src/account.js#L76
     * Notes: adjustements (code refactoring, no change in logic), in terms of: 
     *  - typing (since this is the TypeScript version)
     *  - error handling (in line with erdjs's error system)
     *  - references to crypto functions
     *  - references to object members
     * 
     * Given a password, it will generate the contents for a file containing the current initialised account's private
     * key, passed through a password based key derivation function.
     */
    toKeyFileObject(password: string) {
        let privateKey = this.buffer;
        let publicKey = this.toPublicKey();

        const salt = Buffer.from(nacl.randomBytes(32));
        const iv = Buffer.from(nacl.randomBytes(16));
        const [kdParams, derivedKey] = this.generateDerivedKey(password, salt);
        const cipher = crypto.createCipheriv("aes-128-ctr", derivedKey.slice(0, 16), iv);
        const ciphertext = Buffer.concat([cipher.update(privateKey), cipher.final()]);

        const mac = crypto.createHmac("sha256", derivedKey.slice(16, 32))
            .update(ciphertext)
            .digest();

        const id = uuid({ random: crypto.randomBytes(16) });

        return {
            version: 4,
            id: id,
            address: publicKey.toString(),
            bech32: publicKey.toAddress().toString(),
            crypto: {
                ciphertext: ciphertext.toString("hex"),
                cipherparams: {
                    iv: iv.toString("hex")
                },
                cipher: "aes-128-ctr",
                kdf: "scrypt",
                kdfparams: kdParams,
                mac: mac.toString("hex"),
            }
        };
    }

    private generateDerivedKey(password: string, salt: Buffer): [derivedKey: any, params: any] {
        const kdParams = {
            dklen: 32,
            salt: salt.toString("hex"),
            n: 4096,
            r: 8,
            p: 1,
        };

        const derivedKey = scryptsy(Buffer.from(password), salt, kdParams.n, kdParams.r, kdParams.p, kdParams.dklen);
        return [derivedKey, kdParams];
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
