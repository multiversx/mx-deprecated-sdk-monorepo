import { Transaction } from "./transaction";
import { NetworkConfig } from "./networkConfig";
import { Signature } from "./signature";
import { Address } from "./address";
import { TransactionHash, TransactionOnNetwork, AccountOnNetwork, Balance, TransactionStatus } from ".";
import { Nonce } from "./nonce";

export interface Provider {
    getNetworkConfig(): Promise<NetworkConfig>;

    getAccount(address: Address): Promise<AccountOnNetwork>;
    getBalance(address: Address): Promise<Balance>;
    getNonce(address: Address): Promise<Nonce>;
    
    getVMValueString(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueInt(address: string, funcName: string, args: string[]): Promise<bigint>;
    getVMValueHex(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueQuery(address: string, funcName: string, args: string[]): Promise<any>;
    
    sendTransaction(tx: Transaction): Promise<TransactionHash>;
    getTransaction(txHash: TransactionHash): Promise<TransactionOnNetwork>;
    getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus>;
}

export interface Signer {
    getAddress(): Address;
    sign(signable: Signable): Promise<void>;
}

export interface Signable {
    serializeForSigning(signedBy: Address): Buffer;
    applySignature(signature: Signature, signedBy: Address): void;
}
