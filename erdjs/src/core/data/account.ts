import * as tweetnacl from "tweetnacl";
import * as valid from "./validation";
import * as bech32 from "bech32";
import * as errors from "./errors";
import { Signer, Signable } from "../providers/interface";

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
    private seed: Buffer = Buffer.from("");
    private nonce: number = 0;
    private balance: bigint = BigInt(0);
    private code: string = "";
    private codeHash: string = "";
    private rootHash: string = "";

    private initialized: boolean = false;

    public constructor(data: any) {
        this.set(data);
    }

    public getAddress(): string {
        return this.address.toString();
    }

    public getSeed(): Buffer {
        return this.seed;
    }

    public getNonce(): number {
        return this.nonce;
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

    public sign(signable: Signable): void {
        let bufferToSign = signable.serializeForSigning();

    }

    public setKeysFromRawData(data: any) {
        this.address = new Address(data.pubKey);
        this.seed = valid.Seed(data.privKey);
    }
}

export class AccountSigner implements Signer {
    private account: Account = new Account(null);

    public constructor(acc: Account) {
        this.account = acc;
    }

    public sign(signable: Signable): void {
        let seed = this.account.getSeed();
        console.log("seed length: " + seed.length);
        let pair = tweetnacl.sign.keyPair.fromSeed(seed);
        let signingKey = pair.secretKey;

        let bufferToSign = signable.serializeForSigning();
        let signatureRaw = tweetnacl.sign(new Uint8Array(bufferToSign), signingKey);
        let signature = Buffer.from(signatureRaw.slice(0, signatureRaw.length - bufferToSign.length));

        signable.applySignature(signature);
    }
}
