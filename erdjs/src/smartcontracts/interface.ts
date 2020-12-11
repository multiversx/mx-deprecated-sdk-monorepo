import { Address } from "../address";
import { Balance } from "../balance";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { Argument } from "./argument";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { ContractFunction } from "./function";

/**
 * ISmartContract defines a general interface for operating with {@link SmartContract} objects.
 */
export interface ISmartContract {
    /**
     * Gets the address of the Smart Contract.
     */
    getAddress(): Address;

    /**
     * Creates a {@link Transaction} for deploying the Smart Contract to the Network.
     */
    deploy({ code, codeMetadata, initArguments, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction;

    /**
     * Creates a {@link Transaction} for upgrading the Smart Contract on the Network.
     */
    upgrade({ code, codeMetadata, initArguments, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction;

    /**
     * Creates a {@link Transaction} for calling (a function of) the Smart Contract.
     */ 
    call({ func, args, value, gasLimit }
        : { func: ContractFunction, args?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction;
}

// export interface ERC20Client extends ISmartContract {
//     name(): string;
//     symbol(): string;
//     decimals(): number;
//     totalSupply(): Promise<bigint>;
//     balanceOf(address: string): Promise<bigint>;
//     transfer(receiver: string, value: bigint): Promise<SmartContractCall>;
//     transferFrom(sender: string, receiver: string, value: bigint): Promise<SmartContractCall>;
//     approve(spender: string, value: bigint): Promise<SmartContractCall>;
//     allowance(owner: string, spender: string): Promise<bigint>;
// }

