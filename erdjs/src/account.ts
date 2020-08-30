import { Provider } from "./interface";
import { Address } from "./address";
import { Nonce } from "./nonce";
import { Balance } from "./balance";

export class Account {
    readonly address: Address = new Address();
    nonce: Nonce = new Nonce(0);
    balance: Balance = new Balance(BigInt(0));
    code: string = "";

    private queryResponse: AccountOnNetwork = new AccountOnNetwork();

    /**
     * Creates an account object from an address
     */
    constructor(address: Address) {
        this.address = address;
    }

    /**
     * Queries the details of the account on the Network
     * @param provider the Network provider
     * @param keepLocally whether to save the query response within the object, locally
     */
    async query(provider: Provider, keepLocally: boolean = true): Promise<AccountOnNetwork> {
        this.address.assertNotEmpty();

        let response = await provider.getAccount(this.address);

        if (keepLocally) {
            this.queryResponse = response;
        }

        return response;
    }

    /**
     * Gets a previously saved query response
     */
    queryLocally(): AccountOnNetwork {
        return this.queryResponse;
    }

    /**
     * Synchronizes account properties with the ones queried from the Network
     * @param provider the Network provider
     */
    async sync(provider: Provider) {
        await this.query(provider, true);
        this.nonce = this.queryResponse.nonce;
        this.balance = this.queryResponse.balance;
    }

    incrementNonce() {
        this.nonce.increment();
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
    nonce: Nonce = new Nonce(0);
    balance: Balance = new Balance(BigInt(0));
    code: string = "";

    constructor() {
    }

    static fromHttpResponse(payload: any): AccountOnNetwork {
        let result = new AccountOnNetwork();

        result.nonce = new Nonce(payload["nonce"] || 0);
        result.balance = Balance.fromString(payload["balance"]);
        result.code = payload["code"];

        return result;
    }
}
