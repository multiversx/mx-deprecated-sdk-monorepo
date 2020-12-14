import { Address } from "../../address";
import { TransactionHash } from "../../transaction";
import { QueryResponse } from "../query";
import { PreparedInteraction } from "./preparedInteraction";

export interface IInteractionRunner {
    runBroadcast(interaction: PreparedInteraction): Promise<TransactionHash>;
    runQuery(interaction: PreparedInteraction, caller?: Address): Promise<QueryResponse>;
    runSimulate(interaction: PreparedInteraction): Promise<any>;
}

export interface IInteractionChecker {
    checkInteraction(interaction: PreparedInteraction): void;
}
