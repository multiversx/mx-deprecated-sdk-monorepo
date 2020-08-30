
import { Signer, Signable } from "./interface";
import { Address } from "./address";

export class NullSigner implements Signer {
    constructor() {
    }

    getAddress(): Address {
        return new Address();
    }

    async sign(_: Signable): Promise<void> {
    }
}
