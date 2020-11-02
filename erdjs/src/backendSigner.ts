import { ISigner } from "./interface";
import { SimpleSigner } from "./simpleSigner";

const core = require("@elrondnetwork/elrond-core-js");

export class BackendSigner extends SimpleSigner {
    static fromWalletKey(walletKeyObject: any, password: string): ISigner {
        let account = new core.account();
        account.loadFromKeyFile(walletKeyObject, password);
        let seed = account.privateKey.slice(0, 32);
        return new SimpleSigner(seed);
    }
}
