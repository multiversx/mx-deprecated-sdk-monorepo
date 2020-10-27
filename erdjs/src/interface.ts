import { Transaction, TransactionHash, TransactionOnNetwork, TransactionStatus } from "./transaction";
import { NetworkConfig } from "./networkConfig";
import { Signature } from "./signature";
import { Address } from "./address";
import { Nonce } from "./nonce";
import { AccountOnNetwork } from "./account";
import { Balance } from "./balance";

/**
 * An interface that defines the endpoints of an HTTP API Provider.
 */
export interface IProvider {
    getNetworkConfig(): Promise<NetworkConfig>;

    getAccount(address: Address): Promise<AccountOnNetwork>;
    getBalance(address: Address): Promise<Balance>;
    getNonce(address: Address): Promise<Nonce>;
    
    getVMValueString(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueInt(address: string, funcName: string, args: string[]): Promise<bigint>;
    getVMValueHex(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueQuery(address: string, funcName: string, args: string[]): Promise<any>;
    
    sendTransaction(tx: Transaction): Promise<TransactionHash>;
    simulateTransaction(tx: Transaction): Promise<TransactionHash>;
    getTransaction(txHash: TransactionHash): Promise<TransactionOnNetwork>;
    getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus>;
}

/**
 * An interface that defines a signing-capable object.
 */
export interface ISigner {
    /**
     * Gets the {@link Address} of the signer.
     */
    getAddress(): Address;

    /**
     * Signs a message (e.g. a {@link Transaction}).
     */
    sign(signable: ISignable): Promise<void>;
}

/**
 * An interface that defines a signable object (e.g. a {@link Transaction}).
 */
export interface ISignable {
    /**
     * Returns the signable object in its raw form - a sequence of bytes to be signed.
     */
    serializeForSigning(signedBy: Address): Buffer;

    /**
     * Applies the computed signature on the object itself.
     * 
     * @param signature The computed signature
     * @param signedBy The address of the {@link Signer}
     */
    applySignature(signature: Signature, signedBy: Address): void;
}

/**
 * An interface that defines a disposable object. 
 */
export interface Disposable {
    dispose(): void;
}