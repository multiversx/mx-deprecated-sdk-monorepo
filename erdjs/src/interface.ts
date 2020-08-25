import { Account } from "./account";
import { Transaction } from "./transaction";
import { NetworkConfig } from "./networkConfig";
import { Signature } from "./signature";
import { Address } from "./address";
import { TransactionHash } from ".";

export interface Provider {
    getAccount(address: string): Promise<Account>;
    getBalance(address: string): Promise<bigint>;
    getNonce(address: string): Promise<number>;
    getVMValueString(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueInt(address: string, funcName: string, args: string[]): Promise<bigint>;
    getVMValueHex(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueQuery(address: string, funcName: string, args: string[]): Promise<any>;
    sendTransaction(tx: Transaction): Promise<TransactionHash>;
    getTransactionStatus(txHash: string): Promise<string>;
    getNetworkConfig(): Promise<NetworkConfig>;
}

export interface Signer {
    sign(signable: Signable): Promise<void>;
}

export interface Signable {
    serializeForSigning(signedBy: Address): Buffer;
    applySignature(signature: Signature, signedBy: Address): void;
}
