import * as errors from "../errors";
import nacl from "tweetnacl";
import { UserPublicKey, UserPrivateKey } from "./userKeys";
const crypto = require("crypto");
const uuid = require("uuid/v4");
const scryptsy = require("scryptsy");

// In a future PR, improve versioning infrastructure for key-file objects in erdjs.
const Version = 4;
const CipherAlgorithm = "aes-128-ctr";
const DigestAlgorithm = "sha256";
const KeyDerivationFunction = "scrypt";

export class UserWallet {
    private readonly publicKey: UserPublicKey;
    private readonly randomness: Randomness;
    private readonly ciphertext: Buffer;
    private readonly mac: Buffer;
    private readonly kdfparams: ScryptKeyDerivationParams;

    /**
     * Copied from: https://github.com/ElrondNetwork/elrond-core-js/blob/v1.28.0/src/account.js#L76
     * Notes: adjustements (code refactoring, no change in logic), in terms of: 
     *  - typing (since this is the TypeScript version)
     *  - error handling (in line with erdjs's error system)
     *  - references to crypto functions
     *  - references to object members
     * 
     * Given a password, generates the contents for a file containing the account's private key,
     * passed through a password-based key derivation function (kdf).
     */
    constructor(privateKey: UserPrivateKey, password: string, randomness: Randomness = new Randomness()) {
        const kdParams = new ScryptKeyDerivationParams();
        const derivedKey = UserWallet.generateDerivedKey(Buffer.from(password), randomness.salt, kdParams);
        const derivedKeyFirstHalf = derivedKey.slice(0, 16);
        const derivedKeySecondHalf = derivedKey.slice(16, 32);
        const cipher = crypto.createCipheriv(CipherAlgorithm, derivedKeyFirstHalf, randomness.iv);

        const text = Buffer.concat([privateKey.valueOf(), privateKey.toPublicKey().valueOf()]);
        const ciphertext = Buffer.concat([cipher.update(text), cipher.final()]);
        const mac = crypto.createHmac(DigestAlgorithm, derivedKeySecondHalf).update(ciphertext).digest();

        this.publicKey = privateKey.toPublicKey();
        this.randomness = randomness;
        this.ciphertext = ciphertext;
        this.mac = mac;
        this.kdfparams = kdParams;
    }

    /**
     * Copied from: https://github.com/ElrondNetwork/elrond-core-js/blob/v1.28.0/src/account.js#L42
     * Notes: adjustements (code refactoring, no change in logic), in terms of: 
     *  - typing (since this is the TypeScript version)
     *  - error handling (in line with erdjs's error system)
     *  - references to crypto functions
     *  - references to object members
     * 
     * From an encrypted keyfile, given the password, loads the private key and the public key.
     */
    static loadPrivateKey(keyFileObject: any, password: string): UserPrivateKey {
        const kdfparams = keyFileObject.crypto.kdfparams;
        const salt = Buffer.from(kdfparams.salt, "hex");
        const iv = Buffer.from(keyFileObject.crypto.cipherparams.iv, "hex");
        const ciphertext = Buffer.from(keyFileObject.crypto.ciphertext, "hex");
        const derivedKey = UserWallet.generateDerivedKey(Buffer.from(password), salt, kdfparams);
        const derivedKeyFirstHalf = derivedKey.slice(0, 16);
        const derivedKeySecondHalf = derivedKey.slice(16, 32);
        
        const computedMAC = crypto.createHmac(DigestAlgorithm, derivedKeySecondHalf).update(ciphertext).digest();
        const actualMAC = keyFileObject.crypto.mac;

        if (computedMAC.toString("hex") !== actualMAC) {
            throw new errors.ErrWallet("MAC mismatch, possibly wrong password");
        }

        const decipher = crypto.createDecipheriv(keyFileObject.crypto.cipher, derivedKeyFirstHalf, iv);

        let text = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        while (text.length < 32) {
            let zeroPadding = Buffer.from([0x00]);
            text = Buffer.concat([zeroPadding, text]);
        }

        let seed = text.slice(0, 32);
        return new UserPrivateKey(seed);
    }

    /**
     * Will take about:
     *  - 80-90 ms in Node.js, on a i3-8100 CPU @ 3.60GHz
     *  - 350-360 ms in browser (Firefox), on a i3-8100 CPU @ 3.60GHz
     */
    private static generateDerivedKey(password: Buffer, salt: Buffer, kdfparams: ScryptKeyDerivationParams): Buffer {
        // Question for review: @ccorcoveanu, why not this implementation?
        // https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback
        const derivedKey = scryptsy(password, salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
        return derivedKey;
    }

    /**
     * Converts the encrypted keyfile to plain JavaScript object.
     */
    toJSON(): any {
        return {
            version: Version,
            id: this.randomness.id,
            address: this.publicKey.toString(),
            bech32: this.publicKey.toAddress().toString(),
            crypto: {
                ciphertext: this.ciphertext.toString("hex"),
                cipherparams: { iv: this.randomness.iv.toString("hex") },
                cipher: CipherAlgorithm,
                kdf: KeyDerivationFunction,
                kdfparams: {
                    dklen: this.kdfparams.dklen,
                    salt: this.randomness.salt.toString("hex"),
                    n: this.kdfparams.n,
                    r: this.kdfparams.r,
                    p: this.kdfparams.p
                },
                mac: this.mac.toString("hex"),
            }
        };
    }
}

class ScryptKeyDerivationParams {
    /**
     * numIterations
     */
    n = 4096;

    /**
     * memFactor
     */
    r = 8;

    /**
     * pFactor
     */
    p = 1;

    dklen = 32;
}

export class Randomness {
    salt: Buffer;
    iv: Buffer;
    id: string;

    constructor(init?: Partial<Randomness>) {
        this.salt = init?.salt || Buffer.from(nacl.randomBytes(32));
        this.iv = init?.iv || Buffer.from(nacl.randomBytes(16));
        this.id = init?.id || uuid({ random: crypto.randomBytes(16) });
    }
}
