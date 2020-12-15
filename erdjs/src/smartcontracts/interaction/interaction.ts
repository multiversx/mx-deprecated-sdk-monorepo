import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { Transaction, TransactionHash, TransactionOnNetwork } from "../../transaction";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { ContractFunction } from "../function";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { Argument } from "../argument";
import { IInteractionRunner } from "./interface";
import { EndpointDefinition } from "../typesystem";

/**
 * Interactions are mutable (the interaction runner mutates their content: transaction, query).
 * But they aren't really reusable, therfore their mutability should not cause erroneous usage (generally speaking).
 */

export class Interaction {
    private readonly contract: SmartContract;
    private readonly func: ContractFunction;
    private readonly args: Argument[];
    private readonly runner: IInteractionRunner;

    private value: Balance = Balance.Zero();
    private gasLimit: GasLimit = GasLimit.min();

    private readonly asTransaction: Transaction;
    private readonly asQuery: Query;

    constructor(
        contract: SmartContract,
        func: ContractFunction,
        args: Argument[],
        runner: IInteractionRunner
    ) {
        this.contract = contract;
        this.func = func;
        this.args = args;
        this.runner = runner;

        // Reason: catch badly-typed arguments.
        this.check();

        this.asTransaction = this.contract.call({
            func: func,
            // GasLimit will be set using "withGasLimit()".
            gasLimit: this.gasLimit,
            args: args,
            // Value will be set using "withValue()".
            value: Balance.Zero()
        });

        this.asQuery = new Query({
            address: this.contract.getAddress(),
            func: func,
            args: args,
            // Value will be set using "withValue()".
            value: this.value,
            // Caller will be set by the InteractionRunner.
            caller: new Address()
        });
    }

    getContract(): SmartContract {
        return this.contract;
    }

    getFunction(): ContractFunction {
        return this.func;
    }

    getArguments(): Argument[] {
        return this.args;
    }

    getValue(): Balance {
        return this.value;
    }

    getGasLimit(): GasLimit {
        return this.gasLimit;
    }

    getTransaction(): Transaction {
        return this.asTransaction;
    }

    getQuery(): Query {
        return this.asQuery;
    }

    private check() {
        this.runner.checkInteraction(this);
    }

    async broadcast(): Promise<Transaction> {
        return await this.runner.broadcast(this.asTransaction);
    }

    async broadcastAwaitExecution(): Promise<TransactionOnNetwork> {
        return await this.runner.broadcastAwaitExecution(this.asTransaction);
    }

    async query(caller?: Address): Promise<QueryResponse> {
        let response = await this.runner.query(this.asQuery, caller);
        let endpoint = this.getEndpointDefinition();
        response.setEndpointDefinition(endpoint);
        return response;
    }

    async simulate(): Promise<any> {
        return await this.runner.simulate(this.asTransaction);
    }

    withValue(value: Balance): Interaction {
        this.value = value;
        this.asTransaction.value = value;
        this.asQuery.value = value;

        // Reason: catch errors related to calling "non-payable" functions with some value provided.
        this.check();

        return this;
    }

    withGasLimit(gasLimit: GasLimit): Interaction {
        this.gasLimit = gasLimit;
        this.asTransaction.gasLimit = gasLimit;

        // Reason: catch gas estimation errors - if the checker implementation is smart enough and aware of gas estimations.
        this.check();

        return this;
    }

    getEndpointDefinition(): EndpointDefinition {
        let abi = this.getContract().getAbi();
        let name = this.getFunction().toString();
        let endpoint = abi.findEndpoint(name);

        return endpoint;
    }
}



