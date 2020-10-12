
import { ISigner, ISignable } from "./interface";
import { Address } from "./address";

export class NullSigner implements ISigner {
    constructor() {
    }

    getAddress(): Address {
        return new Address();
    }

    async sign(_: ISignable): Promise<void> {
    }
}
