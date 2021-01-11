import * as errors from "../errors";
import { BLS, ValidatorPrivateKey } from "./validatorKeys";

/**
 * Validator signer (BLS signer)
 */
export class ValidatorSigner {
    /**
     * Signs a message.
     */
    async signUsingPem(pemText: string, pemIndex: number = 0, signable: Buffer): Promise<void> {
        await BLS.initIfNecessary();

        try {
            let privateKey = ValidatorPrivateKey.fromPem(pemText, pemIndex);
            privateKey.sign(signable);
        } catch (err) {
            throw new errors.ErrSignerCannotSign(err);
        }
    }
}
