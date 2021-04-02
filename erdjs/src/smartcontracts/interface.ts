import { Address } from "../address";
import { Balance } from "../balance";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { TransactionOnNetwork } from "../transactionOnNetwork";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { ContractFunction } from "./function";
import { Interaction } from "./interaction";
import { QueryResponse } from "./queryResponse";
import { ReturnCode } from "./returnCode";
import { ImmediateResult, SmartContractResults } from "./smartContractResults";
import { TypedValue } from "./typesystem";

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
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: TypedValue[], value?: Balance, gasLimit: GasLimit }): Transaction;

    /**
     * Creates a {@link Transaction} for upgrading the Smart Contract on the Network.
     */
    upgrade({ code, codeMetadata, initArguments, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: TypedValue[], value?: Balance, gasLimit: GasLimit }): Transaction;

    /**
     * Creates a {@link Transaction} for calling (a function of) the Smart Contract.
     */ 
    call({ func, args, value, gasLimit }
        : { func: ContractFunction, args?: TypedValue[], value?: Balance, gasLimit: GasLimit }): Transaction;
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


export interface IInteractionRunner {
    run(interaction: Interaction): Promise<Transaction>;
    runAwaitExecution(interaction: Interaction): Promise<ExecutionResultsBundle>;
    runQuery(interaction: Interaction, caller?: Address): Promise<QueryResponseBundle>;
    // TODO: Fix method signature (underspecified at this moment).
    runSimulation(interaction: Interaction): Promise<any>;
}

export interface IInteractionChecker {
    checkInteraction(interaction: Interaction): void;
}

export interface ExecutionResultsBundle {
    transactionOnNetwork: TransactionOnNetwork;
    smartContractResults: SmartContractResults;
    immediateResult: ImmediateResult;
    values: TypedValue[];
    firstValue: TypedValue;
    returnCode: ReturnCode;
}

export interface QueryResponseBundle {
    queryResponse: QueryResponse;
    firstValue: TypedValue;
    values: TypedValue[];
    returnCode: ReturnCode;
}
