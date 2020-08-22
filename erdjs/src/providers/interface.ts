import { Account } from "../data/account";
import { Transaction } from "../data/transaction";

export interface Provider {
    getAccount(address: string): Promise<Account>;
    getBalance(address: string): Promise<bigint>;
    getNonce(address: string): Promise<number>;
    getVMValueString(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueInt(address: string, funcName: string, args: string[]): Promise<bigint>;
    getVMValueHex(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueQuery(address: string, funcName: string, args: string[]): Promise<any>;
    sendTransaction(tx: Transaction): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;
    getNetworkConfig(): Promise<any>;
    getChainID(): Promise<string>;
    getMinTransactionVersion(): Promise<number>
}

export interface Signer {
    sign(signable: Signable): void;
}

export interface Signable {
    serializeForSigning(): Buffer;
    applySignature(signature: Buffer): void;
}
