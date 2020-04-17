import * as valid from "./validation";
import * as bech32 from "bech32";
import * as errors from "./errors";

export class Address {
    private buffer: Buffer = Buffer.from("");
    private prefix: string = "";

    public constructor(address: string) {
        if (address != "") {
            this.set(address);
        }
    }

    public set(address: string) {
        let decodedAddress = bech32.decode(address);
        if (decodedAddress.prefix != valid.ADDRESS_PREFIX) {
            throw errors.ErrInvalidAddressPrefix;
        }

        let addressBytes = Buffer.from(bech32.fromWords(decodedAddress.words));
        if (addressBytes.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }
        this.buffer = addressBytes;
    }

    public bytes(): Buffer {
        return this.buffer;
    }

    public hex(): string {
        return this.buffer.toString('hex');
    }

    public toString(): string {
        if (this.buffer.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        let words = bech32.toWords(this.buffer);
        let address = bech32.encode(valid.ADDRESS_PREFIX, words);
        return address;
    }

}

export class Account {
    private address: Address = new Address("");
    private nonce: number = 0;
    private balance: bigint = BigInt(0);
    private code: string = "";
    private codeHash: string = "";
    private rootHash: string = "";

    private initialized: boolean = false;

    public constructor(data: any) {
        this.set(data);
    }

    public getAddress(): Address {
        return this.address;
    }

    public set(data: any) {
        if (data == null) {
            this.initialized = false;
            return;
        }

        this.address = new Address(data.address);
        this.nonce = valid.Nonce(data.nonce);
        this.balance = valid.BalanceString(data.balance);
        this.codeHash = valid.CodeHash(data.codeHash);
        this.code = valid.Code(data.code, this.codeHash);
        this.rootHash = valid.RootHash(data.rootHash);

        this.initialized = true;
    }
}
