import * as errors from "../errors";
import { Address } from "../address";
import { ISignable, ISigner } from "../interface";
import { Signature } from "../signature";
import { UserPrivateKey } from "./userKeys";
import { UserWallet } from "./userWallet";

/**
 * ed25519 signer
 */
export class UserSigner implements ISigner {
    private readonly privateKey: UserPrivateKey;

    constructor(privateKey: UserPrivateKey) {
        this.privateKey = privateKey;
    }

    static fromWallet(keyFileObject: any, password: string): ISigner {
        let privateKey = UserWallet.loadPrivateKey(keyFileObject, password);
        return new UserSigner(privateKey);
    }

    static fromPem(text: string, index: number = 0) {
        let privateKey = UserPrivateKey.fromPem(text, index);
        return new UserSigner(privateKey);
    }
    
    /**
     * Signs a message.
     * @param signable the message to be signed (e.g. a {@link Transaction}).
     */
    async sign(signable: ISignable): Promise<void> {
        try {
            this.trySign(signable);
        } catch (err) {
            throw new errors.ErrSignerCannotSign(err);
        }
    }

    private trySign(signable: ISignable) {
        let signedBy = this.getAddress();
        let bufferToSign = signable.serializeForSigning(signedBy);
        let signatureBuffer = this.privateKey.sign(bufferToSign);
        let signature = new Signature(signatureBuffer);

        signable.applySignature(signature, signedBy);
    }

    /**
     * Gets the address of the signer.
     */
    getAddress(): Address {
        return this.privateKey.toPublicKey().toAddress();
    }
}
