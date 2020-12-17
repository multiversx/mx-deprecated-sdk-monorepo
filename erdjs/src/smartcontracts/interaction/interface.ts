import { Address } from "../../address";
import { Transaction, TransactionHash } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { Interaction } from "./interaction";

export interface IInteractionRunner {
    checkInteraction(interaction: Interaction): void;
    broadcast(transaction: Transaction): Promise<Transaction>;
    broadcastAwaitExecution(transaction: Transaction): Promise<TransactionOnNetwork>;
    query(query: Query, caller?: Address): Promise<QueryResponse>;
    simulate(transaction: Transaction): Promise<any>;
}

export interface IInteractionChecker {
    checkInteraction(interaction: Interaction): void;
}
