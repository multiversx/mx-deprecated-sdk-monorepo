import * as valid from "./utils";
import * as errors from "./errors";
import { Provider, Signer, Signable } from "./interface";
import { Address } from "./address";

export class Account {
    private address: Address = new Address();
    private seed: Buffer = Buffer.from("");
    private nonce: number = 0;
    private balance: bigint = BigInt(0);
    private code: string = "";

    private provider: Provider | null = null;

    private initialized: boolean = false;

    public constructor(provider: Provider, data: any) {
        this.setProvider(provider);
        this.set(data);
    }

    public setProvider(provider: Provider) {
        this.provider = provider;
    }

    public async update(): Promise<void> {
        if (this.provider !== null) {
            let account = await this.provider.getAccount(this.getAddress());
            this.copyFrom(account);
        } else {
            throw errors.ErrProviderNotSet;
        }
    }

    public getAddress(): string {
        return this.address.toString();
    }

    public getAddressObject(): Address {
        return this.address;
    }

    public setAddress(address: string) {
        this.address = new Address(address);
    }

    public getSeed(): Buffer {
        return this.seed;
    }

    public getNonce(): number {
        return this.nonce;
    }

    public getBalance(): bigint {
        return this.balance;
    }

    public incrementNonce() {
        this.nonce++;
    }

    public set(data: any) {
        if (data == null) {
            this.initialized = false;
            return;
        }

        this.address = new Address(data.address);
        //this.nonce = valid.Nonce(data.nonce);
        //this.balance = valid.BalanceString(data.balance);
        
        this.initialized = true;
    }

    public copyFrom(account: Account) {
        this.set(account.getPlain());
    }

    public getPlain(): any {
        return {
            address: this.getAddress(),
            nonce: this.getNonce(),
            balance: this.getBalance(),
            code: this.code,
        };
    }

    public isInitialized(): boolean {
        return this.initialized;
    }
}
