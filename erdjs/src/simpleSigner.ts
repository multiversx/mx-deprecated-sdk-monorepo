
import * as tweetnacl from "tweetnacl";
import { ISigner, ISignable } from "./interface";
import { Address } from "./address";
import { Signature } from "./signature";
const core = require("@elrondnetwork/elrond-core-js");
import * as errors from "./errors";

export const SEED_LENGTH = 32;

/**
 * ed25519 signer that can be created using the seed (recommended for tests only)
 */
export class SimpleSigner implements ISigner {
    private readonly seed: Buffer;

    constructor(seed: string | Buffer) {
        if (seed instanceof Buffer) {
            this.seed = seed;
        } else if (typeof seed === "string") {
            this.seed = Buffer.from(seed, "hex");
        } else {
            throw new errors.ErrInvalidArgument("seed");
        }

        if (this.seed.length != SEED_LENGTH) {
            throw new errors.ErrInvalidArgument("seed");
        }
    }

    static fromWalletKey(walletKeyObject: any, password: string): ISigner {
        let account = new core.account();
        account.loadFromKeyFile(walletKeyObject, password);
        let seed = account.privateKey.slice(0, 32);
        return new SimpleSigner(seed);
    }

    async sign(signable: ISignable): Promise<void> {
        try {
            this.trySign(signable);
        } catch (err) {
            throw new errors.ErrSignerCannotSign(err);
        }
    }

    getAddress(): Address {
        let pair = tweetnacl.sign.keyPair.fromSeed(this.seed);
        let signedBy = new Address(Buffer.from(pair.publicKey));
        return signedBy;
    }

    private trySign(signable: ISignable) {
        let pair = tweetnacl.sign.keyPair.fromSeed(this.seed);
        let signingKey = pair.secretKey;
        let signedBy = new Address(Buffer.from(pair.publicKey));

        let bufferToSign = signable.serializeForSigning(signedBy);
        let signatureRaw = tweetnacl.sign(new Uint8Array(bufferToSign), signingKey);
        let signatureBuffer = Buffer.from(signatureRaw.slice(0, signatureRaw.length - bufferToSign.length));
        let signature = new Signature(signatureBuffer);

        signable.applySignature(signature, signedBy);
    }
}
