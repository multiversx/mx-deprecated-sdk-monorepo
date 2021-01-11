import { guardLength } from "../utils";

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

    static fromPEM() {
        // todo
    }

    toPEM() {
        // todo
    }

    sign(message: Buffer): Buffer {
        let signatureObject = this.secretKey.sign(message);
        let signature = Buffer.from(signatureObject.serialize());
        return signature;
    }

    toString(): string {
        return Buffer.from(this.publicKey.serialize()).toString("hex");
    }
}

export class ValidatorPublicKey {
    
}
