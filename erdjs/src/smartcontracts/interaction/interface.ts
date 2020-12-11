import { TransactionHash } from "../../transaction";
import { QueryResponse } from "../query";
import { PreparedInteraction } from "./preparedInteraction";

export interface IInteractionRunner {
    runBroadcast(interaction: PreparedInteraction): Promise<TransactionHash>;
    runQuery(interaction: PreparedInteraction): Promise<QueryResponse>;
    runSimulate(interaction: PreparedInteraction): Promise<any>;
}
