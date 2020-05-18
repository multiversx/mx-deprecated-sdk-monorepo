import { SmartContractCall } from "./scCall";
import { Provider } from "../providers/interface";

export interface SmartContract {
    enableSigning(enable: boolean): void;
    setProvider(provider: Provider | null): void;
    setGasPrice(gasPrice: number): void;
    setGasLimit(gasLimit: number): void;
    getAddress(): string;
}

export interface ERC20Client extends SmartContract {
    name(): string;
    symbol(): string;
    decimals(): number;
    totalSupply(): Promise<bigint>;
    balanceOf(address: string): Promise<bigint>;
    transfer(receiver: string, value: bigint): Promise<SmartContractCall>;
    transferFrom(sender: string, receiver: string, value: bigint): Promise<SmartContractCall>;
    approve(spender: string, value: bigint): Promise<SmartContractCall>;
    allowance(owner: string, spender: string): Promise<bigint>;
}
