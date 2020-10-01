import { Transaction, TransactionHash, TransactionOnNetwork, TransactionStatus } from "./transaction";
import { NetworkConfig } from "./networkConfig";
import { Signature } from "./signature";
import { Address } from "./address";
import { Nonce } from "./nonce";
import { AccountOnNetwork } from "./account";
import { Balance } from "./balance";

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
    getTransaction(txHash: TransactionHash): Promise<TransactionOnNetwork>;
    getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus>;
}

export interface ISigner {
    getAddress(): Address;
    sign(signable: ISignable): Promise<void>;
}

export interface ISignable {
    serializeForSigning(signedBy: Address): Buffer;
    applySignature(signature: Signature, signedBy: Address): void;
}
