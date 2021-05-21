import { Balance } from "../balance";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { TransactionOnNetwork } from "../transactionOnNetwork";
import { Query } from "./query";
import { QueryResponse } from "./queryResponse";
import { ContractFunction } from "./function";
import { Address } from "../address";
import { SmartContract } from "./smartContract";
import { EndpointDefinition, TypedValue } from "./typesystem";
import { Nonce } from "../nonce";
import { ExecutionResultsBundle, QueryResponseBundle } from "./interface";
import { ErrInvariantFailed } from "../errors";

/**
 * Interactions can be seen as mutable transaction & query builders.
 * 
 * Aside from building transactions and queries, the interactors are also responsible for interpreting
 * the execution outcome for the objects they've built.
 */
export class Interaction {
    private readonly contract: SmartContract;
    private readonly func: ContractFunction;
    private readonly args: TypedValue[];
    private readonly receiver?: Address;

    private nonce: Nonce = new Nonce(0);
    private value: Balance = Balance.Zero();
    private gasLimit: GasLimit = GasLimit.min();

    constructor(
        contract: SmartContract,
        func: ContractFunction,
        args: TypedValue[],
        receiver?: Address,
    ) {
        this.contract = contract;
        this.func = func;
        this.args = args;
        this.receiver = receiver;
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

    buildTransaction(): Transaction {
        // TODO: create as "deploy" transaction if the function is "init" (or find a better pattern for deployments).
        let transaction = this.contract.call({
            func: this.func,
            // GasLimit will be set using "withGasLimit()".
            gasLimit: this.gasLimit,
            args: this.args,
            // Value will be set using "withValue()".
            value: this.value,
            receiver: this.receiver,
        });

        transaction.setNonce(this.nonce);
        return transaction;
    }

    buildQuery(): Query {
        return new Query({
            address: this.contract.getAddress(),
            func: this.func,
            args: this.args,
            // Value will be set using "withValue()".
            value: this.value,
            // Caller will be set by the InteractionRunner.
            caller: new Address()
        });
    }

    /**
     * Interprets the results of a previously broadcasted (and fully executed) smart contract transaction.
     * The outcome is structured such that it allows quick access to each level of detail.
     */
    interpretExecutionResults(transactionOnNetwork: TransactionOnNetwork): ExecutionResultsBundle {
        return interpretExecutionResults(this.getEndpoint(), transactionOnNetwork);
    }

    /**
     * Interprets the raw outcome of a Smart Contract query.
     * The outcome is structured such that it allows quick access to each level of detail.
     */
    interpretQueryResponse(queryResponse: QueryResponse): QueryResponseBundle {
        let endpoint = this.getEndpoint();
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
        return this;
    }

    withGasLimit(gasLimit: GasLimit): Interaction {
        this.gasLimit = gasLimit;
        return this;
    }

    withNonce(nonce: Nonce): Interaction {
        this.nonce = nonce;
        return this;
    }

    getEndpoint(): EndpointDefinition {
        return this.getContract().getAbi().getEndpoint(this.getFunction());
    }
}

function interpretExecutionResults(endpoint: EndpointDefinition, transactionOnNetwork: TransactionOnNetwork): ExecutionResultsBundle {
    let smartContractResults = transactionOnNetwork.getSmartContractResults();
    let immediateResult = smartContractResults.getImmediate();

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
