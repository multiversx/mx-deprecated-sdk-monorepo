import { ISignable, IProvider } from "./interface";
import { Address } from "./address";
import { Balance } from "./balance";
import { GasPrice, GasLimit, TransactionVersion, ChainID } from "./networkParams";
import { NetworkConfig } from "./networkConfig";
import { Nonce } from "./nonce";
import { Signature } from "./signature";
import { guardEmpty, guardNotEmpty, guardType } from "./utils";
import { TransactionPayload } from "./transactionPayload";
import * as errors from "./errors";
import { TypedEvent } from "./events";
import { TransactionWatcher } from "./transactionWatcher";
import { ProtoSerializer } from "./proto";
import { Hash } from "./hash";
const createTransactionHasher = require("blake2b");

const TRANSACTION_VERSION = new TransactionVersion(1);
const TRANSACTION_HASH_LENGTH = 32;

/**
 * An abstraction for creating, signing and broadcasting Elrond transactions.
 */
export class Transaction implements ISignable {
    readonly onSigned: TypedEvent<{ transaction: Transaction, signedBy: Address }>;
    readonly onSent: TypedEvent<{ transaction: Transaction }>;
    readonly onStatusUpdated: TypedEvent<{ transaction: Transaction }>;
    readonly onStatusChanged: TypedEvent<{ transaction: Transaction }>;

    /**
     * The nonce of the transaction (the account sequence number of the sender).
     */
    private nonce: Nonce;

    /**
     * The value to transfer.
     */
    private value: Balance;

    /**
     * The address of the sender.
     */
    private sender: Address;

    /**
     * The address of the receiver.
     */
    private readonly receiver: Address;

    /**
     * The gas price to be used.
     */
    private gasPrice: GasPrice;

    /**
     * The maximum amount of gas to be consumed when processing the transaction.
     */
    private gasLimit: GasLimit;

    /**
     * The payload of the transaction.
     */
    private readonly data: TransactionPayload;

    /**
     * The chain ID of the Network (e.g. "1" for Mainnet).
     */
    private readonly chainID: ChainID;

    /**
     * The version, required by the Network in order to correctly interpret the contents of the transaction.
     */
    private readonly version: TransactionVersion;

    /**
     * The signature.
     */
    private signature: Signature;

    /**
     * The transaction hash, also used as a transaction identifier.
     */
    private hash: TransactionHash;

    /**
     * A (cached) representation of the transaction, as fetched from the API.
     */
    private asOnNetwork: TransactionOnNetwork = new TransactionOnNetwork();

    /**
     * The last known status of the transaction, as fetched from the API.
     * 
     * This only gets updated if {@link Transaction.awaitPending}, {@link Transaction.awaitExecuted} are called.
     */
    private status: TransactionStatus;

    /**
     * Creates a new Transaction object.
     */
    public constructor(
        { nonce, value, receiver, gasPrice, gasLimit, data, chainID }:
            { nonce?: Nonce, value?: Balance, receiver: Address, gasPrice?: GasPrice, gasLimit?: GasLimit, data?: TransactionPayload, chainID?: ChainID }) {
        this.nonce = nonce || new Nonce(0);
        this.value = value || Balance.Zero();
        this.sender = Address.Zero();
        this.receiver = receiver;
        this.gasPrice = gasPrice || NetworkConfig.getDefault().MinGasPrice;
        this.gasLimit = gasLimit || NetworkConfig.getDefault().MinGasLimit;
        this.data = data || new TransactionPayload();
        this.chainID = chainID || NetworkConfig.getDefault().ChainID;
        this.version = TRANSACTION_VERSION;

        this.signature = Signature.empty();
        this.hash = TransactionHash.empty();
        this.status = TransactionStatus.createUnknown();

        this.onSigned = new TypedEvent();
        this.onSent = new TypedEvent();
        this.onStatusUpdated = new TypedEvent();
        this.onStatusChanged = new TypedEvent();

        // We apply runtime type checks for these fields, since they are the most commonly misused when calling the Transaction constructor
        // in JavaScript (which lacks type safety).
        guardType("nonce", Nonce, this.nonce);
        guardType("gasLimit", GasLimit, this.gasLimit);
        guardType("gasPrice", GasPrice, this.gasPrice);
    }

    getNonce(): Nonce {
        return this.nonce;
    }

    /**
     * Sets the account sequence number of the sender. Must be done prior signing.
     * 
     * ```
     * await alice.sync(provider);
     * 
     * let tx = new Transaction({
     *      value: Balance.eGLD(1),
     *      receiver: bob.address
     * });
     * 
     * tx.setNonce(alice.nonce);
     * await aliceSigner.sign(tx);
     * ```
     */
    setNonce(nonce: Nonce) {
        this.nonce = nonce;
        this.doAfterPropertySetter();
    }

    getValue(): Balance {
        return this.value;
    }

    setValue(value: Balance) {
        this.value = value;
        this.doAfterPropertySetter();
    }

    getSender(): Address {
        return this.sender;
    }

    getReceiver(): Address {
        return this.receiver;
    }

    getGasPrice(): GasPrice {
        return this.gasPrice;
    }

    setGasPrice(gasPrice: GasPrice) {
        this.gasPrice = gasPrice;
        this.doAfterPropertySetter();
    }

    getGasLimit(): GasLimit {
        return this.gasLimit;
    }

    setGasLimit(gasLimit: GasLimit) {
        this.gasLimit = gasLimit;
        this.doAfterPropertySetter();
    }

    getData(): TransactionPayload {
        return this.data;
    }

    getChainID(): ChainID {
        return this.chainID;
    }

    getVersion(): TransactionVersion {
        return this.version;
    }

    doAfterPropertySetter() {
        this.signature = Signature.empty();
        this.hash = TransactionHash.empty();
    }

    getSignature(): Signature {
        guardNotEmpty(this.signature, "signature");
        return this.signature;
    }

    getHash(): TransactionHash {
        guardNotEmpty(this.hash, "hash");
        return this.hash;
    }

    getStatus(): TransactionStatus {
        return this.status;
    }

    /**
     * Serializes a transaction to a sequence of bytes, ready to be signed. 
     * This function is called internally, by {@link Signer} objects.
     * 
     * @param signedBy The address of the future signer
     */
    serializeForSigning(signedBy: Address): Buffer {
        let plain = this.toPlainObject(signedBy);
        let serialized = JSON.stringify(plain);

        return Buffer.from(serialized);
    }

    /**
     * Converts the transaction object into a ready-to-serialize, plain JavaScript object.
     * This function is called internally within the signing procedure.
     * 
     * @param sender The address of the sender (will be provided when called within the signing procedure)
     */
    toPlainObject(sender?: Address): any {
        let result: any = {
            nonce: this.nonce.valueOf(),
            value: this.value.toString(),
            receiver: this.receiver.bech32(),
            sender: sender ? sender.bech32() : this.sender.bech32(),
            gasPrice: this.gasPrice.valueOf(),
            gasLimit: this.gasLimit.valueOf(),
            data: this.data.isEmpty() ? undefined : this.data.encoded(),
            chainID: this.chainID.valueOf(),
            version: this.version.valueOf(),
            signature: this.signature.isEmpty() ? undefined : this.signature.hex()
        };

        return result;
    }

    /**
     * Applies the signature on the transaction.
     * 
     * @param signature The signature, as computed by a {@link ISigner}.
     * @param signedBy The address of the signer.
     */
    applySignature(signature: Signature, signedBy: Address) {
        guardEmpty(this.signature, "signature");
        guardEmpty(this.hash, "hash");

        this.signature = signature;
        this.sender = signedBy;

        this.hash = TransactionHash.compute(this);
        this.onSigned.emit({ transaction: this, signedBy: signedBy });
    }

    /**
     * Broadcasts a transaction to the Network, via a {@link IProvider}.
     * 
     * ```
     * let provider = new ProxyProvider("https://gateway.elrond.com");
     * // ... Prepare, sign the transaction, then:
     * await tx.send(provider);
     * await tx.awaitExecuted(provider);
     * ```
     */
    async send(provider: IProvider): Promise<TransactionHash> {
        this.hash = await provider.sendTransaction(this);

        this.onSent.emit({ transaction: this });
        return this.hash;
    }

    /**
     * Simulates a transaction on the Network, via a {@link IProvider}.
     */
    async simulate(provider: IProvider): Promise<any> {
        let response = await provider.simulateTransaction(this);
        return response;
    }

    /**
     * Converts a transaction to a ready-to-broadcast object.
     * Called internally by the {@link IProvider}.
     */
    toSendable(): any {
        if (this.signature.isEmpty()) {
            throw new errors.ErrTransactionNotSigned();
        }

        return this.toPlainObject();
    }

    /**
     * Fetches a representation of the transaction (whether pending, processed or finalized), as found on the Network.
     * 
     * @param provider The provider to use
     * @param cacheLocally Whether to cache the response locally, on the transaction object
     */
    async getAsOnNetwork(provider: IProvider, cacheLocally: boolean = true): Promise<TransactionOnNetwork> {
        if (this.hash.isEmpty()) {
            throw new errors.ErrTransactionHashUnknown();
        }

        let includeOutcome = this.receiver.isContractAddress();
        let response = await provider.getTransaction(this.hash, this.sender, includeOutcome);

        if (cacheLocally) {
            this.asOnNetwork = response;
        }

        return response;
    }

    /**
     * Returns the cached representation of the transaction, as previously fetched using {@link Transaction.getAsOnNetwork}.
     */
    getAsOnNetworkCached(): TransactionOnNetwork {
        return this.asOnNetwork;
    }

    async awaitSigned(): Promise<void> {
        if (!this.signature.isEmpty()) {
            return;
        }

        return new Promise<void>((resolve, _reject) => {
            this.onSigned.on(() => resolve());
        });
    }

    async awaitHashed(): Promise<void> {
        if (!this.hash.isEmpty()) {
            return;
        }

        return new Promise<void>((resolve, _reject) => {
            this.onSigned.on(() => resolve());
        });
    }

    /**
     * Awaits for a transaction to reach its "pending" state - that is, for the transaction to be accepted in the mempool.
     * Performs polling against the provider, via a {@link TransactionWatcher}.
     */
    async awaitPending(provider: IProvider): Promise<void> {
        let watcher = new TransactionWatcher(this.hash, provider);
        await watcher.awaitPending(this.notifyStatusUpdate.bind(this));
    }

    /**
     * Awaits for a transaction to reach its "executed" state - that is, for the transaction to be processed (whether with success or with errors).
     * Performs polling against the provider, via a {@link TransactionWatcher}.
     */
    async awaitExecuted(provider: IProvider): Promise<void> {
        let watcher = new TransactionWatcher(this.hash, provider);
        await watcher.awaitExecuted(this.notifyStatusUpdate.bind(this));
    }

    private notifyStatusUpdate(newStatus: TransactionStatus) {
        let sameStatus = this.status.equals(newStatus);

        this.onStatusUpdated.emit({ transaction: this });

        if (!sameStatus) {
            this.status = newStatus;
            this.onStatusChanged.emit({ transaction: this });
        }
    }

    async awaitNotarized(provider: IProvider): Promise<void> {
        let watcher = new TransactionWatcher(this.hash, provider);
        await watcher.awaitNotarized();
}
}

/**
 * An abstraction for handling and computing transaction hashes.
 */
export class TransactionHash extends Hash {
    constructor(hash: string) {
        super(hash);
    }

    /**
     * Computes the hash of a transaction.
     * Not yet implemented.
     */
    static compute(transaction: Transaction): TransactionHash {
        let serializer = new ProtoSerializer();
        let buffer = serializer.serializeTransaction(transaction);
        let hash = createTransactionHasher(TRANSACTION_HASH_LENGTH).update(buffer).digest("hex");
        return new TransactionHash(hash);
    }
}

/**
 * An abstraction for handling and interpreting the "status" field of a {@link Transaction}.
 */
export class TransactionStatus {
    /**
     * The raw status, as fetched from the Network.
     */
    readonly status: string;

    /**
     * Creates a new TransactionStatus object.
     */
    constructor(status: string) {
        this.status = (status || "").toLowerCase();
    }

    /**
     * Creates an unknown status.
     */
    static createUnknown(): TransactionStatus {
        return new TransactionStatus("unknown");
    }

    /**
     * Returns whether the transaction is pending (e.g. in mempool).
     */
    isPending(): boolean {
        return this.status == "received" || this.status == "pending" || this.status == "partially-executed";
    }

    /**
     * Returns whether the transaction has been executed (not necessarily with success).
     */
    isExecuted(): boolean {
        return this.isSuccessful() || this.isInvalid();
    }

    /**
     * Returns whether the transaction has been executed successfully.
     */
    isSuccessful(): boolean {
        return this.status == "executed" || this.status == "success" || this.status == "successful";
    }

    /**
     * Returns whether the transaction has been executed, but with a failure.
     */
    isFailed(): boolean {
        return this.status == "fail" || this.status == "failed" || this.status == "unsuccessful" || this.isInvalid();
    }

    /**
     * Returns whether the transaction has been executed, but marked as invalid (e.g. due to "insufficient funds").
     */
    isInvalid(): boolean {
        return this.status == "invalid";
    }

    toString(): string {
        return this.status;
    }

    valueOf(): string {
        return this.status;
    }

    equals(other: TransactionStatus) {
        if (!other) {
            return false;
        }

        return this.status == other.status;
    }
}

/**
 * A plain view of a transaction, as queried from the Network.
 */
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
        result.gasLimit = new GasLimit(payload["gasLimit"]);
        result.data = TransactionPayload.fromEncoded(payload["data"]);
        result.status = new TransactionStatus(payload["status"]);

        return result;
    }
}

/**
 * Not yet implemented.
 */
export class TransactionOnNetworkType {
    readonly value: string;

    constructor(value?: string) {
        this.value = value || "unknown";
    }
}
