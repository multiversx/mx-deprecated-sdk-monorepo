import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { Transaction } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { ContractFunction } from "../function";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { EndpointDefinition, TypedValue } from "../typesystem";
import { Nonce } from "../../nonce";
import { ImmediateResult, SmartContractResults } from "../smartContractResults";
import { ReturnCode } from "../returnCode";
import { ExecutionResultsBundle, QueryResponseBundle } from "./interface";

/**
 * Interactions are mutable (the interaction runner mutates their content: transaction, query).
 * But they aren't really reusable, therfore their mutability should not cause erroneous usage (generally speaking).
 */

export class Interaction {
    private readonly contract: SmartContract;
    private readonly func: ContractFunction;
    private readonly args: TypedValue[];

    private value: Balance = Balance.Zero();
    private gasLimit: GasLimit = GasLimit.min();

    private readonly asTransaction: Transaction;
    private readonly asQuery: Query;

    constructor(
        contract: SmartContract,
        func: ContractFunction,
        args: TypedValue[]
    ) {
        this.contract = contract;
        this.func = func;
        this.args = args;

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

    /**
     * Interprets the results of a previously broadcasted (and fully executed) smart contract transaction.
     * The outcome is structured such that it allows quick access to each level of detail.
     */
    interpretExecutionResults(transactionOnNetwork: TransactionOnNetwork): ExecutionResultsBundle {
        let smartContractResults = transactionOnNetwork.getSmartContractResults();
        let immediateResult = smartContractResults.getImmediate();
        let endpoint = this.getEndpointDefinition();

        immediateResult.setEndpointDefinition(endpoint);

        let values = immediateResult.outputTyped();
        let returnCode = immediateResult.getReturnCode();

        return {
            transactionOnNetwork: transactionOnNetwork,
            smartContractResults: smartContractResults,
            immediateResult: immediateResult,
            values: values,
            firstValue: values[0],
            returnCode: returnCode
        };
    }

    /**
     * Interprets the raw outcome of a Smart Contract query.
     * The outcome is structured such that it allows quick access to each level of detail.
     */
    interpretQueryResponse(queryResponse: QueryResponse): QueryResponseBundle {
        let endpoint = this.getEndpointDefinition();
        queryResponse.setEndpointDefinition(endpoint);

        let values = queryResponse.outputTyped();
        let returnCode = queryResponse.returnCode;

        return {
            queryResponse: queryResponse,
            values: values,
            firstValue: values[0],
            returnCode: returnCode
        };
    }

    withValue(value: Balance): Interaction {
        this.value = value;
        this.asTransaction.setValue(value);
        this.asQuery.value = value;

        return this;
    }

    withGasLimit(gasLimit: GasLimit): Interaction {
        this.gasLimit = gasLimit;
        this.asTransaction.setGasLimit(gasLimit);

        return this;
    }

    withNonce(nonce: Nonce): Interaction {
        this.asTransaction.setNonce(nonce);
        return this;
    }

    getEndpointDefinition(): EndpointDefinition {
        let abi = this.getContract().getAbi();
        let name = this.getFunction().toString();
        let endpoint = abi.getEndpoint(name);

        return endpoint;
    }
}
