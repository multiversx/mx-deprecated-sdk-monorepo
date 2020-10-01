import { Address } from "../address";
import { Balance } from "../balance";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { Argument } from "./argument";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { ContractFunction } from "./function";
//import { SmartContractCall } from "./scCall";
//import { Provider } from "../interface";

export interface SmartContract {
    getAddress(): Address;

    deploy({ code, codeMetadata, initArguments, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction;
    upgrade({ code, codeMetadata, initArguments, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction;
    call({ func, args, value, gasLimit }
        : { func: ContractFunction, args?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction;
}

export interface ERC20Client extends SmartContract {
    name(): string;
    symbol(): string;
    decimals(): number;
    totalSupply(): Promise<bigint>;
    balanceOf(address: string): Promise<bigint>;
    // transfer(receiver: string, value: bigint): Promise<SmartContractCall>;
    // transferFrom(sender: string, receiver: string, value: bigint): Promise<SmartContractCall>;
    // approve(spender: string, value: bigint): Promise<SmartContractCall>;
    allowance(owner: string, spender: string): Promise<bigint>;
}
