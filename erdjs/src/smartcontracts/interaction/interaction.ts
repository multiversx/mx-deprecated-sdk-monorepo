import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { Transaction } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { ContractFunction } from "../function";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { IInteractionRunner } from "./interface";
import { EndpointDefinition, TypedValue } from "../typesystem";
import { Nonce } from "../../nonce";
import { ImmediateResult, SmartContractResults } from "../smartContractResults";
import { ReturnCode } from "../returnCode";

/**
 * Interactions are mutable (the interaction runner mutates their content: transaction, query).
 * But they aren't really reusable, therfore their mutability should not cause erroneous usage (generally speaking).
 */

export class Interaction {
    private readonly contract: SmartContract;
    private readonly func: ContractFunction;
    private readonly args: TypedValue[];
    private readonly runner: IInteractionRunner;

    private value: Balance = Balance.Zero();
    private gasLimit: GasLimit = GasLimit.min();

    private readonly asTransaction: Transaction;
    private readonly asQuery: Query;

    constructor(
        contract: SmartContract,
        func: ContractFunction,
        args: TypedValue[],
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

    getArguments(): TypedValue[] {
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

    /**
     * Broadcasts the transaction and awaits for its execution.
     * The outcome is structured such that it allows quick access to each level of detail.
     */
    async broadcastAwaitExecution(): Promise<
        {
            asOnNetwork: TransactionOnNetwork,
            smartContractResults: SmartContractResults,
            immediateResult: ImmediateResult,
            values: TypedValue[],
            firstValue: TypedValue,
            returnCode: ReturnCode
        }> {
        let asOnNetwork = await this.runner.broadcastAwaitExecution(this.asTransaction);
        let endpoint = this.getEndpointDefinition();
        let smartContractResults = asOnNetwork.getSmartContractResults();
        let immediateResult = smartContractResults.getImmediate();

        immediateResult.setEndpointDefinition(endpoint);

        let values = immediateResult.outputTyped();
        let returnCode = immediateResult.getReturnCode();

        return {
            asOnNetwork: asOnNetwork,
            smartContractResults: smartContractResults,
            immediateResult: immediateResult,
            values: values,
            firstValue: values[0],
            returnCode: returnCode
        };
    }

    /**
     * Runs a query against the Smart Contract.
     * The outcome is structured such that it allows quick access to each level of detail.
     */
    async query(caller?: Address): Promise<{
        response: QueryResponse,
        firstValue: TypedValue,
        values: TypedValue[],
        returnCode: ReturnCode
    }> {
        let response = await this.runner.query(this.asQuery, caller);
        let endpoint = this.getEndpointDefinition();
        response.setEndpointDefinition(endpoint);

        let values = response.outputTyped();
        let returnCode = response.returnCode;

        return {
            response: response,
            values: values,
            firstValue: values[0],
            returnCode: returnCode
        };
    }

    async simulate(): Promise<any> {
        return await this.runner.simulate(this.asTransaction);
    }

    withValue(value: Balance): Interaction {
        this.value = value;
        this.asTransaction.setValue(value);
        this.asQuery.value = value;

        // Reason: catch errors related to calling "non-payable" functions with some value provided.
        this.check();

        return this;
    }

    withGasLimit(gasLimit: GasLimit): Interaction {
        this.gasLimit = gasLimit;
        this.asTransaction.setGasLimit(gasLimit);

        // Reason: catch gas estimation errors - if the checker implementation is smart enough and aware of gas estimations.
        this.check();

        return this;
    }

    withNonce(nonce: Nonce): Interaction {
        this.asTransaction.setNonce(nonce);
        return this;
    }

    getEndpointDefinition(): EndpointDefinition {
        let abi = this.getContract().getAbi();
        let name = this.getFunction().toString();
        let endpoint = abi.findEndpoint(name);

        return endpoint;
    }
}
