import { Address } from "../../address";
import { TransactionHash } from "../../transaction";
import { QueryResponse } from "../query";
import { IInteractionRunner } from "./interface";
import { PreparedInteraction } from "./preparedInteraction";

export class WebInteractionRunner implements IInteractionRunner {
    // TODO: Use WalletProvider. No ProxyProvider.

    runBroadcast(_interaction: PreparedInteraction): Promise<TransactionHash> {
        throw new Error("Method not implemented.");
    }

    runQuery(_interaction: PreparedInteraction, _caller?: Address): Promise<QueryResponse> {
        throw new Error("Method not implemented.");
    }

    runSimulate(_interaction: PreparedInteraction): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
