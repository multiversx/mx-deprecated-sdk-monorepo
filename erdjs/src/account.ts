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

    public constructor(data: any) {
        this.set(data);
    }

    // public async update(): Promise<void> {
    //     if (this.provider !== null) {
    //         let account = await this.provider.getAccount(this.getAddress());
    //         this.copyFrom(account);
    //     } else {
    //         throw errors.ErrProviderNotSet;
    //     }
    // }

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
            return;
        }

        this.address = new Address(data.address);
        //this.nonce = valid.Nonce(data.nonce);
        //this.balance = valid.BalanceString(data.balance);
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
}


// class Account(IAccount):
//     def __init__(self, address: Any = None, pem_file: Union[str, None] = None, pem_index: int = 0, key_file: str = "", pass_file: str = ""):
//         self.address = Address(address)
//         self.pem_file = pem_file
//         self.pem_index = int(pem_index)
//         self.nonce: int = 0

//         if pem_file:
//             seed, pubkey = pem.parse(self.pem_file, self.pem_index)
//             self.private_key_seed = seed.hex()
//             self.address = Address(pubkey)
//         elif key_file and pass_file:
//             password = get_password(pass_file)
//             address_from_key_file, seed = load_from_key_file(key_file, password)
//             self.private_key_seed = seed.hex()
//             self.address = Address(address_from_key_file)

//     def sync_nonce(self, proxy: Any):
//         logger.info("Account.sync_nonce()")
//         self.nonce = proxy.get_account_nonce(self.address)
//         logger.info(f"Account.sync_nonce() done: {self.nonce}")

//     def get_seed(self) -> bytes:
//         return unhexlify(self.private_key_seed)