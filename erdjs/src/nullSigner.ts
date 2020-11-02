
import { ISigner, ISignable } from "./interface";
import { Address } from "./address";

/**
 * Null-object pattern: a null Signer, which does nothing.
 */
export class NullSigner implements ISigner {
    /**
     * Creates a NullSigner.
     */
    constructor() {
    }

    /**
     * Returns a void {@link Address}
     */
    getAddress(): Address {
        return new Address();
    }

    /**
     * Does nothing.
     */
    async sign(_: ISignable): Promise<void> {
    }
}
