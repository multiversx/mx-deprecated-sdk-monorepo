import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { Transaction, TransactionHash } from "../../transaction";
import { IInteractionRunner } from "./interface";
import { Query, QueryResponse } from "../query";

/**
 * Interactions are mutable (the interaction runner mutates their content: transaction, query).
 * But they aren't really reusable, therfore their mutability should not cause erroneous usage (generally speaking).
 */

export class PreparedInteraction {
    readonly runner: IInteractionRunner;
    readonly transaction: Transaction;
    readonly query: Query;

    constructor(runner: IInteractionRunner, transaction: Transaction, query: Query) {
        this.runner = runner;
        this.transaction = transaction;
        this.query = query;
    }

    async runBroadcast(): Promise<TransactionHash> {
        return this.runner.runBroadcast(this);
    }

    async runQuery(): Promise<QueryResponse> {
        return this.runner.runQuery(this);
    }

    async runSimulate(): Promise<any> {
        return this.runner.runSimulate(this);
    }

    withValue(value: Balance): PreparedInteraction {
        this.transaction.value = value;
        this.query.value = value;

        return this;
    }

    withGasLimit(gasLimit: GasLimit): PreparedInteraction {
        this.transaction.gasLimit = gasLimit;

        return this;
    }
}
