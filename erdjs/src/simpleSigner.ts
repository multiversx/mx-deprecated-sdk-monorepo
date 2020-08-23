
import * as tweetnacl from "tweetnacl";
import { Signer, Signable } from "./interface";
import { errors } from ".";

export const SEED_LENGTH = 32;

/**
 * ed25519 signer that can be created using the seed (recommended for tests only)
 */
export class SimpleSigner implements Signer {
    private readonly seed: Buffer;

    public constructor(seed: string | Buffer) {
        if (seed instanceof Buffer) {
            this.seed = seed;
        } else if (typeof seed === "string") {
            this.seed = Buffer.from(seed, "hex");
        } else {
            throw new errors.ErrInvalidArgument("seed", seed);
        }

        if (this.seed.length != SEED_LENGTH) {
            throw new errors.ErrInvalidArgument("seed", seed);
        }
    }

    public async sign(signable: Signable): Promise<void> {
        try {
            this.trySign(signable);
        } catch (err) {
            throw new errors.ErrSignerCannotSign(err);
        }
    }

    private trySign(signable: Signable) {
        let pair = tweetnacl.sign.keyPair.fromSeed(this.seed);
        let signingKey = pair.secretKey;

        let bufferToSign = signable.serializeForSigning();
        let signatureRaw = tweetnacl.sign(new Uint8Array(bufferToSign), signingKey);
        let signature = Buffer.from(signatureRaw.slice(0, signatureRaw.length - bufferToSign.length));

        signable.applySignature(signature);
    }
}
