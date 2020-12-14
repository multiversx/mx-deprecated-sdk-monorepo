import { Address } from "../../address";
import { Transaction, TransactionHash, TransactionOnNetwork } from "../../transaction";
import { Query, QueryResponse } from "../query";
import { Interaction } from "./interaction";
import { IInteractionRunner } from "./interface";

export class WebInteractionRunner implements IInteractionRunner {
    checkInteraction(_interaction: Interaction): void {
        throw new Error("Method not implemented.");
    }

    broadcast(_transaction: Transaction): Promise<TransactionHash> {
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
