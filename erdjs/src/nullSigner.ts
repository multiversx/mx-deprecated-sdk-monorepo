
import { Signer, Signable } from "./interface";

export class NullSigner implements Signer {
    public constructor() {
    }

    public async sign(_: Signable): Promise<void> {
    }
}
