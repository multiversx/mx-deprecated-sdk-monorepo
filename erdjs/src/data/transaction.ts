import * as valid from "./validation";
import * as errors from "../errors";
import { Signer, Signable, Provider } from "../providers/interface";

/* type Transaction struct { */
/* 	Nonce     uint64 `form:"nonce" json:"nonce"` */
/* 	Value     string `form:"value" json:"value"` */
/* 	Receiver  string `form:"receiver" json:"receiver"` */
/* 	Sender    string `form:"sender" json:"sender"` */
/* 	GasPrice  uint64 `form:"gasPrice" json:"gasPrice,omitempty"` */
/* 	GasLimit  uint64 `form:"gasLimit" json:"gasLimit,omitempty"` */
/* 	Data      string `form:"data" json:"data,omitempty"` */
/* 	Signature string `form:"signature" json:"signature,omitempty"` */
/* } */

export class Transaction implements Signable {
    // TODO Sender and Receiver should be of type Account, to
    // allow their validation before creating the transaction.
    protected hash: string = "";
    protected sender: string = "";
    protected receiver: string = "";
    protected value: bigint = BigInt(0);
    protected nonce: number = 0;
    protected gasPrice: number = 0;
    protected gasLimit: number = 0;
    protected data: string = "";
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

        this.sender = valid.Address(data.sender);
        this.receiver = valid.Address(data.receiver);
        this.value = valid.TxValue(data.value);
        this.nonce = valid.Nonce(data.nonce);
        this.gasPrice = valid.GasPrice(data.gasPrice);
        this.gasLimit = valid.GasLimit(data.gasLimit);
        this.data = valid.TxData(data.data);

        this.initialized = true;
        this.signed = false;
    }

    public setTxHash(txHash: string) {
        // TODO validate against the transaction itself
        this.hash = txHash;
    }

    public setSender(sender: string) {
        this.sender = valid.Address(sender);
    }

    public setReceiver(receiver: string) {
        this.receiver = valid.Address(receiver);
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

    public getStatus(): string {
        return this.status;
    }

    public getNonce(): number {
        return this.nonce;
    }

    public getSender(): string {
        return this.sender;
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

export var ErrExpectedTransactionStatusNotReached = new Error("expected transaction status not reached");

export class TransactionWatcher {
    private txHash: string = "";
    private provider: Provider | null = null;
    private stop: boolean = false;

    constructor(hash: string, provider: Provider) {
        this.txHash = hash;
        this.provider = provider;
    }

    public async awaitReceived(period: number, timeout: number): Promise<void> {
        // TODO "executed" or later, not just "executed"
        await this.awaitStatus("received", period, timeout);
    }

    public async awaitExecuted(period: number, timeout: number): Promise<void> {
        // TODO "executed" or later, not just "executed"
        await this.awaitStatus("executed", period, timeout);
    }

    public async awaitStatus(awaited_status: string, period: number, timeout: number): Promise<void> {
        if (this.provider == null) {
            throw errors.ErrProviderNotSet;
        }

        this.stop = false;

        let txStatus = "";
        let periodicTimer = new AsyncTimer();
        let timeoutTimer = new AsyncTimer();
        timeoutTimer.start(timeout).finally(() => {console.log('timeoutTimer.stop'); timeoutTimer.stop(); this.stop = true;});

        while (this.stop == false) {
            console.log('getting status for', this.txHash);
            txStatus = await this.provider.getTransactionStatus(this.txHash);
            console.log('status', txStatus);
            if (txStatus != awaited_status && this.stop == false) {
                console.log('not done yet, and stop =', this.stop, ', waiting');
                await periodicTimer.start(period);
                console.log('done waiting');
            } else {
                console.log('stop');
                break;
            }
        }

        timeoutTimer.stop();

        let result = false;
        if (this.stop == false && txStatus == awaited_status) {
            result = true;
        }

        console.log('exiting expectExecuted() with result =', result);

        if (result == false) {
            throw ErrExpectedTransactionStatusNotReached;
        }
    }
}

// TODO add tests for this class
class AsyncTimer {
    // TODO replace 'any' with a proper type
    private timeout: any = null;
    private rejectTimeoutPromise: any = null;

    constructor() {
    }

    public start(timeout: number): Promise<void> {
        if (this.timeout != null) {
            throw errors.ErrAsyncTimerAlreadyRunning;
        }

        return new Promise<void>((resolve, reject) => {
            this.rejectTimeoutPromise = reject;
            let resolutionCallback = () => {
                console.log('async timer: resolution');
                this.rejectTimeoutPromise = null;
                this.stop();
                resolve();
            };

            this.timeout = setTimeout(resolutionCallback, timeout);
        });
    }

    public abort() {
        if (this.rejectTimeoutPromise != null) {
            this.rejectTimeoutPromise();
            console.log('async timer: promise rejected');
            this.rejectTimeoutPromise = null;
        }
        this.stop();
    }

    public stop() {
        console.log('async timer: stop');
        if (this.timeout != null) {
            clearTimeout(this.timeout);
            console.log('async timer: clearTimeout');
            this.timeout = null;
        }
    }
}
