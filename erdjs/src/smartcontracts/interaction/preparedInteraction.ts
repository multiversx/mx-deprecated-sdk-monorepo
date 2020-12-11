import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { Transaction, TransactionHash } from "../../transaction";
import { IInteractionChecker, IInteractionRunner } from "./interface";
import { Query, QueryResponse } from "../query";
import { ContractFunction } from "../function";

/**
 * Interactions are mutable (the interaction runner mutates their content: transaction, query).
 * But they aren't really reusable, therfore their mutability should not cause erroneous usage (generally speaking).
 */

export class PreparedInteraction {
    readonly func: ContractFunction;
    readonly checker: IInteractionChecker;
    readonly runner: IInteractionRunner;
    readonly transaction: Transaction;
    readonly query: Query;

    constructor(func: ContractFunction, checker: IInteractionChecker, runner: IInteractionRunner, transaction: Transaction, query: Query) {
        this.func = func;
        this.checker = checker;
        this.runner = runner;
        this.transaction = transaction;
        this.query = query;

        // Reason: catch badly-typed arguments.
        this.check();
    }

    private check() {
        this.checker.checkInteraction(this);
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

        // Reason: catch errors related to calling "non-payable" functions with some value provided.
        this.check();

        return this;
    }

    withGasLimit(gasLimit: GasLimit): PreparedInteraction {
        this.transaction.gasLimit = gasLimit;

        // Reason: catch gas estimation errors - if the checker implementation is smart enough and aware of gas estimations.
        this.check();

        return this;
    }
}
