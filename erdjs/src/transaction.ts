import * as valid from "./validation";
import * as errors from "./errors";
import { Signer, Signable, Provider } from "./interface";
import { Address } from "./address";

export class Transaction implements Signable {
    protected hash: string = "";
    protected sender: Address = Address.Zero();
    protected receiver: Address = Address.Zero();
    protected value: bigint = BigInt(0);
    protected nonce: number = 0;
    protected gasPrice: number = 0;
    protected gasLimit: number = 0;
    protected data: string = "";
    protected chainID: string = "";
    protected version: number = 0;
    protected signature: string = "";

    protected signed: boolean = false;
    protected initialized: boolean = false;
    protected status: string = "unknown";

    protected provider: Provider | null = null;

    public constructor(data: any) {
        this.set(data);
    }

    public set(data: any) {
        if (data == null) {
            this.initialized = false;
            this.signed = false;

            return;
        }

        this.sender = new Address(data.sender);
        this.receiver = new Address(data.receiver);
        this.value = valid.TxValue(data.value);
        this.nonce = valid.Nonce(data.nonce);
        this.gasPrice = valid.GasPrice(data.gasPrice);
        this.gasLimit = valid.GasLimit(data.gasLimit);
        this.data = valid.TxData(data.data);
        this.chainID = valid.ChainID(data.chainID);
        this.version = valid.Version(data.version);

        this.initialized = true;
        this.signed = false;
    }

    public setTxHash(txHash: string) {
        // TODO validate against the transaction itself
        this.hash = txHash;
    }

    public setSender(sender: Address) {
        this.sender = sender;
    }

    public setReceiver(receiver: Address) {
        this.receiver = receiver;
    }

    public setValue(txValue: string) {
        this.value = valid.TxValue(txValue);
    }

    public setNonce(nonce: number) {
        this.nonce = valid.Nonce(nonce);
    }

    public setGasPrice(gasPrice: number) {
        this.gasPrice = valid.GasPrice(gasPrice);
    }

    public setGasLimit(gasLimit: number) {
        this.gasLimit = valid.GasLimit(gasLimit);
    }

    public setData(data: string) {
        this.data = valid.TxData(data);
    }

    public setProvider(provider: Provider) {
        this.provider = provider;
    }

    public setStatus(status: string) {
        this.status = status;
    }

    public setChainID(chainID: string) {
        this.chainID = valid.ChainID(chainID);
    }

    public setVersion(version: number) {
        this.version = valid.Version(version);
    }

    public getStatus(): string {
        return this.status;
    }

    public getNonce(): number {
        return this.nonce;
    }

    // public getSender(): string {
    //     return this.sender;
    // }

    public getData(): string {
        return this.data;
    }

    // TODO change this method to take no arguments,
    // and to use this.Sender as the signer, because
    // Account implements the Signer interface.
    public sign(signer: Signer) {
        signer.sign(this);
    }

    public getPlain(): any {
        let plainTx: any = {
            nonce: this.nonce,
            value: this.value.toString(),
            receiver: this.receiver,
            sender: this.sender,
        };

        if (this.gasPrice > 0) {
            plainTx.gasPrice = this.gasPrice;
        }
        if (this.gasLimit > 0) {
            plainTx.gasLimit = this.gasLimit;
        }
        if (this.data != "") {
            plainTx.data = this.data;
        }

        plainTx.chainID = this.chainID;
        plainTx.version = this.version;

        return plainTx;
    }

    public getAsSendable(): any {
        if (!this.signed) {
            throw errors.ErrTransactionNotSigned;
        }

        let tx = this.getPlain();
        tx.signature = this.signature;

        return tx;
    }

    public serializeForSigning(): Buffer {
        let tx = this.getPlain();

        let serializedTx = JSON.stringify(tx);
        return Buffer.from(serializedTx);
    }

    public applySignature(signature: Buffer) {
        // TODO throw error if the signature can't be validated against
        // this.address (which is the public key)
        this.signature = signature.toString('hex');
        this.signed = true;
    }
}


