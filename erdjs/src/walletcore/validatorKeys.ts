import * as errors from "../errors";
import { guardLength } from "../utils";
import { parseValidatorKey } from "./pem";

const bls = require('@elrondnetwork/bls-wasm');

export const VALIDATOR_SECRETKEY_LENGTH = 32;
export const VALIDATOR_PUBKEY_LENGTH = 96;

export class BLS {
    private static isInitialized: boolean = false;

    static async initIfNecessary() {
        if (BLS.isInitialized) {
            return;
        }

        await bls.init(bls.BLS12_381);

        BLS.isInitialized = true;
    }

    static guardInitialized() {
        if (!BLS.isInitialized) {
            throw new errors.ErrInvariantFailed("BLS modules are not initalized. Make sure that 'await BLS.initIfNecessary()' is called correctly.");
        }
    }
}

export class ValidatorSecretKey {
    private readonly secretKey: any;
    private readonly publicKey: any;

    constructor(buffer: Buffer) {
        BLS.guardInitialized();
        guardLength(buffer, VALIDATOR_SECRETKEY_LENGTH);

        this.secretKey = new bls.SecretKey();
        this.secretKey.setLittleEndian(Uint8Array.from(buffer));
        this.publicKey = this.secretKey.getPublicKey();
    }

    static fromPem(text: string, index: number = 0) {
        return parseValidatorKey(text, index);
    }

    generatePublicKey(): ValidatorPublicKey {
        let buffer = Buffer.from(this.publicKey.serialize());
        return new ValidatorPublicKey(buffer);
    }

    sign(message: Buffer): Buffer {
        let signatureObject = this.secretKey.sign(message);
        let signature = Buffer.from(signatureObject.serialize());
        return signature;
    }

    hex(): string {
        return this.valueOf().toString("hex");
    }

    valueOf(): Buffer {
        return Buffer.from(this.secretKey.serialize());
    }
}

export class ValidatorPublicKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, VALIDATOR_PUBKEY_LENGTH);

        this.buffer = buffer;
    }

    hex(): string {
        return this.buffer.toString("hex");
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}
