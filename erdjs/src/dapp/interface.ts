import {Transaction} from "../transaction";

export interface IDappProvider {
    init(): Promise<boolean>;
    login(callbackUrl?: string): Promise<string>;
    logout(): Promise<boolean>;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    isConnected(): Promise<boolean>;
    sendTransaction(transaction: Transaction, callbackUrl?: string): Promise<Transaction>;
}

export interface IDappMessageEvent extends MessageEvent {
    data: {
        type: string,
        data: any,
        error: string,
    };
}

export interface IHWElrondApp {
    getAddress(account: number, index: number, display?: boolean): Promise<{
        publicKey: string,
        address: string,
        chainCode?: string,
    }>;
    signTransaction(rawTx: Buffer): Promise<string>;
    getAppConfiguration(): Promise<{
        version: string,
        contractData: number,
        accountIndex: number,
        addressIndex: number,
    }>;
}
