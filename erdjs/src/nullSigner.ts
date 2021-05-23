
import { ISigner, ISignable } from "./interface";
import { Address } from "./address";
import { Signature } from "./signature";

/**
 * Null-object pattern: a null Signer, which does nothing.
 * 
 * Useful for contract interaction flows with query-only purposes.
 */
export class NullSigner implements ISigner {
    private readonly address: Address;

    /**
     * Creates a NullSigner.
     */
    constructor(address: Address) {
        this.address = address;
    }

    getAddress(): Address {
        return this.address;
    }

    /**
     * Applies a mock signature.
     */
    async sign(signable: ISignable): Promise<void> {
        signable.applySignature(new Signature("0".repeat(128)), this.address);
    }
}
