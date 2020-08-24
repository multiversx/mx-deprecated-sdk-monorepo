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
    hash: string = "";
    status: string = "unknown";

    public constructor(init?: Partial<Transaction>) {
        Object.assign(this, init);
    }

    serializeForSigning(): Buffer {
        let tx = this.toPlainObject();

        let serializedTx = JSON.stringify(tx);
        return Buffer.from(serializedTx);
    }

    private toPlainObject(): any {
        let result: any = {
            nonce: this.nonce.value,
            value: this.value.raw(),
            receiver: this.receiver.bech32(),
            sender: this.sender.bech32(),
            gasPrice: this.gasPrice.value,
            gasLimit: this.gasLimit.value,
            data: this.data.isEmpty() ? undefined : this.data.encoded(),
            chainID: this.chainID.value,
            version: this.version.value
        };

        return result;
    }

    applySignature(signature: Signature, signedBy: Address) {
        this.signature = signature;
        this.sender = signedBy;
    }

    send(provider: Provider) {
        provider.sendTransaction(this);
    }

    getAsSendable(): any {
        if (!this.signature) {
            throw new errors.ErrTransactionNotSigned();
        }

        let tx = this.toPlainObject();
        tx.signature = this.signature.hex();
        return tx;
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
}
