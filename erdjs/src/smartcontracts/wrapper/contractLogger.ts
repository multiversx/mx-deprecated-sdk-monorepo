import { Address } from "../../address";
import { NetworkConfig } from "../../networkConfig";
import { Transaction } from "../../transaction";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { ImmediateResult, ResultingCall, SmartContractResults } from "../smartContractResults";


/**
 * Provides a simple interface in order to easily call or query the smart contract's methods.
 */
export class ContractLogger {
    constructor() {
    }

    synchronizedNetworkConfig(networkConfig: NetworkConfig) {
        console.log(`Synchronized network config - chainID: ${networkConfig.ChainID.valueOf()}`);
    }

    transactionCreated(transaction: Transaction) {
        console.log(`Transaction created - tx: ${transaction.getHash()} data: ${transaction.getData().toString()}`);
    }

    deploySent(transaction: Transaction) {
        console.log(`Deploy sent - tx: ${transaction.getHash()}`);
    }

    deployComplete(transaction: Transaction, smartContractResults: SmartContractResults, smartContractAddress: Address) {
        logReturnMessages(transaction, smartContractResults);
        console.log(`Deploy complete - tx: ${transaction.getHash()} - smart contract at address: ${smartContractAddress.bech32()}`);
    }

    transactionSent(transaction: Transaction) {
        console.log(`Transaction sent - tx: ${transaction.getHash()}`);
    }

    transactionComplete(result: any, resultData: string, transaction: Transaction, smartContractResults: SmartContractResults) {
        logReturnMessages(transaction, smartContractResults);
        console.log(`Transaction complete - tx: ${transaction.getHash()} result: ${result} data: ${resultData}`);
    }

    queryCreated(query: Query) {
        console.log(`Query created - query.func: ${query.func} query.args: ${query.args}`);
    }

    queryComplete(result: any, response: QueryResponse) {
        console.log(`Query complete - result: ${result} response.returnData: ${response.returnData.toString()}`);
    }
}

function logReturnMessages(transaction: Transaction, smartContractResults: SmartContractResults) {
    let immediate = smartContractResults.getImmediate();
    logSmartContractResultIfMessage("(immediate)", transaction, immediate);

    let resultingCalls = smartContractResults.getResultingCalls();
    for (let i in resultingCalls) {
        logSmartContractResultIfMessage("(resulting call)", transaction, resultingCalls[i]);
    }
}

function logSmartContractResultIfMessage(info: string, transaction: Transaction, smartContractResult: ResultingCall | ImmediateResult) {
    if (smartContractResult.returnMessage) {
        console.log(`Return message ${info} for tx: ${transaction.getHash()} message: ${smartContractResult.returnMessage}`);
    }
}
