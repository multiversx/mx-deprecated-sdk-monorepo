import { Signable, Provider } from "./interface";
import { Address } from "./address";
import { Balance } from "./balance";
import { GasPrice, GasLimit, TransactionVersion, ChainID } from "./networkParams";
import { NetworkConfig } from "./networkConfig";
import { Nonce } from "./nonce";
import { errors } from ".";
import { Signature } from "./signature";

export class Transaction implements Signable {
    nonce: Nonce = new Nonce(0);
    value: Balance = Balance.Zero();
    sender: Address = Address.Zero();
    receiver: Address = Address.Zero();
    gasPrice: GasPrice = NetworkConfig.Default.MinGasPrice;
    gasLimit: GasLimit = NetworkConfig.Default.MinGasLimit;
    data: TransactionPayload = new TransactionPayload();
    chainID: ChainID = NetworkConfig.Default.ChainID;
    version: TransactionVersion = NetworkConfig.Default.MinTransactionVersion;
    
    signature: Signature = new Signature();
    hash: TransactionHash = new TransactionHash("");
    status: string = "unknown";

    public constructor(init?: Partial<Transaction>) {
        Object.assign(this, init);
    }

    serializeForSigning(signedBy: Address): Buffer {
        let plain = this.toPlainObject(signedBy);
        let serialized = JSON.stringify(plain);

        return Buffer.from(serialized);
    }

    toPlainObject(sender?: Address): any {
        let result: any = {
            nonce: this.nonce.value,
            value: this.value.raw(),
            receiver: this.receiver.bech32(),
            sender: sender ? sender.bech32() : this.sender.bech32(),
            gasPrice: this.gasPrice.value,
            gasLimit: this.gasLimit.value,
            data: this.data.isEmpty() ? undefined : this.data.encoded(),
            chainID: this.chainID.value,
            version: this.version.value,
            signature: this.signature.isEmpty() ? undefined : this.signature.hex()
        };

        return result;
    }

    applySignature(signature: Signature, signedBy: Address) {
        this.signature = signature;
        this.sender = signedBy;
    }

    async send(provider: Provider): Promise<TransactionHash> {
        this.hash = await provider.sendTransaction(this); 
        return this.hash;
    }

    toSendable(): any {
        if (this.signature.isEmpty()) {
            throw new errors.ErrTransactionNotSigned();
        }

        return this.toPlainObject();
    }
}

export class TransactionPayload {
    private data: string;

    constructor(data?: string) {
        this.data = data || "";
    }

    isEmpty(): boolean {
        return this.data.length == 0;
    }

    encoded(): string {
        return Buffer.from(this.data).toString("base64");
    }

    decoded(): string {
        return this.data;
    }

    length(): number {
        return this.data.length;
    }
}

export class TransactionHash {
    readonly hash: string;

    constructor(hash: string) {
        this.hash = hash;
    }

    toString(): string {
        return this.hash;
    }
}