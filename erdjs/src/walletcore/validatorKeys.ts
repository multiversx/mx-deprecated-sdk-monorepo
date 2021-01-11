import { guardLength } from "../utils";
import { parseValidatorKey } from "./pem";

const bls = require('@elrondnetwork/bls-wasm');

export class BLS {
    private static isInitialized: boolean = false;

    static async initIfNecessary() {
        if (BLS.isInitialized) {
            return;
        }

        await bls.init(bls.BLS12_381);

        BLS.isInitialized = true;
    }
}

export class ValidatorPrivateKey {
    private readonly secretKey: any;
    private readonly publicKey: any;

    constructor(buffer: Buffer) {
        guardLength(buffer, 32);

        this.secretKey = new bls.SecretKey();
        this.secretKey.setLittleEndian(Uint8Array.from(buffer));
        this.publicKey = this.secretKey.getPublicKey();
    }

    static fromPem(text: string, index: number = 0) {
        return parseValidatorKey(text, index);
    }

    toPublicKey(): ValidatorPublicKey {
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
        this.buffer = buffer;
    }

    hex(): string {
        return this.buffer.toString("hex");
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}
