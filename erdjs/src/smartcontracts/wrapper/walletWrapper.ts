import { Account } from "../../account";
import { TestWallet } from "../../testutils";
import { IProvider } from "../../interface";

export class WalletWrapper {
    wallet: TestWallet;
    provider: IProvider;
    account: Account;

    constructor(
        wallet: TestWallet,
        provider: IProvider
    ) {
        this.wallet = wallet;
        this.provider = provider;
        this.account = new Account(wallet.address);
    }

    sync() {
        this.account.sync(this.provider);
    }

    static use(testWallet: TestWallet, provider: IProvider) {
        let wallet = new WalletWrapper(testWallet, provider);
        wallet.account.sync(provider);
        return wallet;
    }
}
