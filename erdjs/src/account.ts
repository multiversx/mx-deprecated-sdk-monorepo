import * as tweetnacl from "tweetnacl";
import * as valid from "./validation";
import * as bech32 from "bech32";
import * as errors from "./errors";
import { Provider, Signer, Signable } from "./interface";

export class Account {
    private address: Address = new Address();
    private seed: Buffer = Buffer.from("");
    private nonce: number = 0;
    private balance: bigint = BigInt(0);
    private code: string = "";
    private codeHash: string = "";
    private rootHash: string = "";

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
        this.nonce = valid.Nonce(data.nonce);
        this.balance = valid.BalanceString(data.balance);
        this.codeHash = valid.CodeHash(data.codeHash);
        this.code = valid.Code(data.code, this.codeHash);
        this.rootHash = valid.RootHash(data.rootHash);

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
            codeHash: this.codeHash,
            rootHash: this.rootHash
        };
    }

    public setKeysFromRawData(data: any) {
        this.address = new Address(data.pubKey);
        this.seed = valid.Seed(data.privKey);
    }

    public isInitialized(): boolean {
        return this.initialized;
    }
}

export class AccountSigner implements Signer {
    private account: Account | null = null;

    public constructor(acc: Account) {
        this.account = acc;
    }

    public sign(signable: Signable): void {
        if (this.account != null) {
            let seed = this.account.getSeed();
            let pair = tweetnacl.sign.keyPair.fromSeed(seed);
            let signingKey = pair.secretKey;

            let bufferToSign = signable.serializeForSigning();
            let signatureRaw = tweetnacl.sign(new Uint8Array(bufferToSign), signingKey);
            let signature = Buffer.from(signatureRaw.slice(0, signatureRaw.length - bufferToSign.length));

            signable.applySignature(signature);
        }
    }
}

export class Address {
    private buffer: Buffer = Buffer.from("");
    private prefix: string = "";

    public constructor(address?: string) {
        if (address) {
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
        this.prefix = decodedAddress.prefix;
    }

    public setHex(addressHex: string): Address {
        var addressBytes = Buffer.from(addressHex, 'hex');
        if (addressBytes.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        this.buffer = addressBytes;
        return this;
    }

    public setBytes(bytes: Buffer): Address {
        if (bytes.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        this.buffer = bytes;
        return this;
    }

    public getPrefix(): string {
        return this.prefix;
    }

    public bytes(): Buffer {
        return this.buffer;
    }

    public hex(): string {
        return this.buffer.toString('hex');
    }

    public equals(other: Address | null): boolean {
        if (!other) {
            return false;
        }

        return this.hex() == other.hex();
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
