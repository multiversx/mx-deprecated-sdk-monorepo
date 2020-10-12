import { IProvider } from "./interface";
import { Address } from "./address";
import { Nonce } from "./nonce";
import { Balance } from "./balance";

export class Account {
    readonly address: Address = new Address();
    nonce: Nonce = new Nonce(0);
    balance: Balance = new Balance(BigInt(0));
    code: string = "";

    private asOnNetwork: AccountOnNetwork = new AccountOnNetwork();

    /**
     * Creates an account object from an address
     */
    constructor(address: Address) {
        this.address = address;
    }

    /**
     * Queries the details of the account on the Network
     * @param provider the Network provider
     * @param cacheLocally whether to save the query response within the object, locally
     */
    async getAsOnNetwork(provider: IProvider, cacheLocally: boolean = true): Promise<AccountOnNetwork> {
        this.address.assertNotEmpty();

        let response = await provider.getAccount(this.address);

        if (cacheLocally) {
            this.asOnNetwork = response;
        }

        return response;
    }

    /**
     * Gets a previously saved query response
     */
    getAsOnNetworkCached(): AccountOnNetwork {
        return this.asOnNetwork;
    }

    /**
     * Synchronizes account properties (such as nonce, balance) with the ones queried from the Network
     * @param provider the Network provider
     */
    async sync(provider: IProvider) {
        await this.getAsOnNetwork(provider, true);
        this.nonce = this.asOnNetwork.nonce;
        this.balance = this.asOnNetwork.balance;
    }

    incrementNonce() {
        this.nonce = this.nonce.increment();
    }

    toPlainObject(): any {
        return {
            address: this.address.bech32(),
            nonce: this.nonce.value,
            balance: this.balance.raw(),
            code: this.code
        };
    }
}

export class AccountOnNetwork {
    address: Address = new Address();
    nonce: Nonce = new Nonce(0);
    balance: Balance = new Balance(BigInt(0));
    code: string = "";

    constructor(init?: Partial<AccountOnNetwork>) {
        Object.assign(this, init);
    }

    static fromHttpResponse(payload: any): AccountOnNetwork {
        let result = new AccountOnNetwork();

        result.address = new Address(payload["address"] || 0);
        result.nonce = new Nonce(payload["nonce"] || 0);
        result.balance = Balance.fromString(payload["balance"]);
        result.code = payload["code"];

        return result;
    }
}
