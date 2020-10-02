import { ISignable, IProvider } from "./interface";
import { Address } from "./address";
import { Balance } from "./balance";
import { Account } from "./account";
import { GasPrice, GasLimit, TransactionVersion, ChainID } from "./networkParams";
import { NetworkConfig } from "./networkConfig";
import { Nonce } from "./nonce";
import { Signature } from "./signature";
import { guardType } from "./utils";
import { TransactionPayload } from "./transactionPayload";
import * as errors from "./errors";
import { TypedEvent } from "./events";
import keccak from "keccak";
import { TransactionWatcher } from "./transactionWatcher";

const TRANSACTION_VERSION = new TransactionVersion(1);

export class Transaction implements ISignable {
    onSigned: TypedEvent<{ transaction: Transaction, signedBy: Address }>;

    nonce: Nonce;
    value: Balance;
    sender: Address;
    receiver: Address;
    gasPrice: GasPrice;
    gasLimit: GasLimit;
    data: TransactionPayload;
    chainID: ChainID;
    version: TransactionVersion;

    signature: Signature;
    hash: TransactionHash;

    private queryResponse: TransactionOnNetwork = new TransactionOnNetwork();

    public constructor(init?: Partial<Transaction>) {
        this.nonce = new Nonce(0);
        this.value = Balance.Zero();
        this.sender = Address.Zero();
        this.receiver = Address.Zero();
        this.gasPrice = NetworkConfig.getDefault().MinGasPrice;
        this.gasLimit = NetworkConfig.getDefault().MinGasLimit;
        this.data = new TransactionPayload();
        this.chainID = NetworkConfig.getDefault().ChainID;
        this.version = TRANSACTION_VERSION;

        this.signature = new Signature();
        this.hash = new TransactionHash("");

        Object.assign(this, init);

        this.onSigned = new TypedEvent();

        guardType("nonce", Nonce, this.nonce);
        guardType("gasLimit", GasLimit, this.gasLimit);
        guardType("gasPrice", GasPrice, this.gasPrice);
    }

    setNonce(nonce: Nonce) {
        this.nonce = nonce;
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

        this.onSigned.emit({ transaction: this, signedBy: signedBy });
        this.hash = TransactionHash.compute(this);
    }

    async send(provider: IProvider): Promise<TransactionHash> {
        this.hash = await provider.sendTransaction(this);
        return this.hash;
    }

    toSendable(): any {
        if (this.signature.isEmpty()) {
            throw new errors.ErrTransactionNotSigned();
        }

        return this.toPlainObject();
    }

    async getAsOnNetwork(provider: IProvider, cacheLocally: boolean = true): Promise<TransactionOnNetwork> {
        if (this.hash.isEmpty()) {
            throw new errors.ErrTransactionHashUnknown();
        }

        let response = await provider.getTransaction(this.hash);

        if (cacheLocally) {
            this.queryResponse = response;
        }

        return response;
    }

    getAsOnNetworkCached(): TransactionOnNetwork {
        return this.queryResponse;
    }

    queryStatus(): any {
        return {};
    }

    async awaitPending(provider: IProvider): Promise<void> {
        let watcher = new TransactionWatcher(this.hash, provider);
        await watcher.awaitPending();
    }

    async awaitExecuted(provider: IProvider): Promise<void> {
        let watcher = new TransactionWatcher(this.hash, provider);
        await watcher.awaitExecuted();
    }
}

export class TransactionHash {
    readonly hash: string;

    constructor(hash: string) {
        this.hash = hash;
    }

    isEmpty(): boolean {
        return !this.hash;
    }

    toString(): string {
        return this.hash;
    }

    static compute(transaction: Transaction): TransactionHash {
        // TODO: Fix this, to use the actual algorithm, not a dummy one.
        let dummyData = `this!is!not!the!real!hash!${JSON.stringify(transaction)}`;
        let buffer = Buffer.from(dummyData);
        let hash = keccak("keccak256").update(buffer).digest();
        return new TransactionHash(hash.toString("hex"));
    }
}

export class TransactionStatus {
    readonly status: string;

    constructor(status: string) {
        this.status = (status || "").toLowerCase();
    }

    static createUnknown(): TransactionStatus {
        return new TransactionStatus("unknown");
    }

    isPending(): boolean {
        return this.status == "received" || this.status == "pending" || this.status == "partially-executed";
    }

    isExecuted(): boolean {
        return this.status == "executed" || this.status == "invalid";
    }

    isSuccessful(): boolean {
        return this.status == "executed";
    }

    toString(): string {
        return this.status;
    }
}

export class TransactionOnNetwork {
    type: TransactionOnNetworkType = new TransactionOnNetworkType();
    nonce?: Nonce;
    round?: number;
    epoch?: number;
    value?: Balance;
    receiver?: Address;
    sender?: Address;
    gasPrice?: GasPrice;
    gasLimit?: GasLimit;
    data?: TransactionPayload;
    signature?: Signature;
    status: TransactionStatus;

    constructor(init?: Partial<TransactionOnNetwork>) {
        Object.assign(this, init);

        this.status = TransactionStatus.createUnknown();
    }

    static fromHttpResponse(payload: any): TransactionOnNetwork {
        let result = new TransactionOnNetwork();

        result.type = new TransactionOnNetworkType(payload["type"]);
        result.nonce = new Nonce(payload["nonce"] || 0);
        result.round = payload["round"];
        result.epoch = payload["epoch"];
        result.value = Balance.fromString(payload["value"]);
        result.sender = Address.fromBech32(payload["sender"]);
        result.receiver = Address.fromBech32(payload["receiver"]);
        result.gasPrice = new GasPrice(payload["gasPrice"]);
        result.gasLimit = new GasPrice(payload["gasLimit"]);
        result.data = TransactionPayload.fromEncoded(payload["data"]);
        result.status = new TransactionStatus(payload["status"]);

        return result;
    }
}

export class TransactionOnNetworkType {
    readonly value: string;

    constructor(value?: string) {
        this.value = value || "unknown";
    }
}
