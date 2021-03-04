import { Address } from "../../address";
import { Transaction } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { Interaction } from "./interaction";
import { IInteractionRunner } from "./interface";

// Question for review: perhaps we don't need this WebInteractionRunner, and the WalletProvider will implement IInteractionRunner as well?
// Or perhaps should we keep this as a wrapper and only forward "broadcast()" and "broadcastAwaitExecution()" to the WalletProvider?
export class WebInteractionRunner implements IInteractionRunner {
    checkInteraction(_interaction: Interaction): void {
        throw new Error("Method not implemented.");
    }

    broadcast(_transaction: Transaction): Promise<Transaction> {
        throw new Error("Method not implemented.");
    }

    broadcastAwaitExecution(_transaction: Transaction): Promise<TransactionOnNetwork> {
        throw new Error("Method not implemented.");
    }

    query(_query: Query, _caller?: Address): Promise<QueryResponse> {
        throw new Error("Method not implemented.");
    }

    simulate(_transaction: Transaction): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
