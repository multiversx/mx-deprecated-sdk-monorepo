import { Address } from "../../address";
import { Transaction } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { QueryResponse } from "../queryResponse";
import { ReturnCode } from "../returnCode";
import { ImmediateResult, SmartContractResults } from "../smartContractResults";
import { TypedValue } from "../typesystem";
import { Interaction } from "./interaction";

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

