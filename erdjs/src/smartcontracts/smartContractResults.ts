import { Address } from "../address";
import { Balance } from "../balance";
import { Hash } from "../hash";
import { GasLimit, GasPrice } from "../networkParams";
import { Nonce } from "../nonce";
import { Arguments, EndpointDefinition, ReturnCode } from ".";
import { TransactionHash } from "../transaction";
import { TransactionOnNetwork } from "../transactionOnNetwork";
import { guardNotEmpty, guardValueIsSet } from "../utils";

export class SmartContractResults {
    private items: SmartContractResultItem[] = [];
    private original?: TransactionOnNetwork;

    static fromHttpResponse(smartContractResults: any[]): SmartContractResults {
        let results = new SmartContractResults();
        results.items = (smartContractResults || []).map((item: any) => SmartContractResultItem.fromHttpResponse(item));
        return results;
    }

    attachOriginalTransaction(originalTransaction: TransactionOnNetwork) {
        this.original = originalTransaction;
    }

    getImmediateResult(): ImmediateResult {
        let withNextNonce = this.findWithNextNonce();
        return new ImmediateResult(withNextNonce);
    }

    private findWithNextNonce(): SmartContractResultItem {
        guardValueIsSet("original", this.original);
        guardNotEmpty(this.items, "items");

        let originalNonce = this.original!.nonce;
        let nextNonce = originalNonce.increment();
        let withNextNonce = this.items.find(item => item.nonce.equals(nextNonce));
        guardValueIsSet("withNextNonce", withNextNonce);

        return withNextNonce!;
    }

    getResultingCalls(): ResultingCall[] {
        let withNextNonce = this.findWithNextNonce();
        let otherItems = this.items.filter(item => item != withNextNonce);
        let resultingCalls = otherItems.map(item => new ResultingCall(item));

        return resultingCalls;
    }
}

export class SmartContractResultItem {
    hash: Hash = Hash.empty();
    nonce: Nonce = new Nonce(0);
    value: Balance = Balance.Zero();
    receiver: Address = new Address();
    sender: Address = new Address();
    dataTokens: Buffer[] = [];
    previousHash: Hash = Hash.empty();
    originalHash: Hash = Hash.empty();
    gasLimit: GasLimit = new GasLimit(0);
    gasPrice: GasPrice = new GasPrice(0);
    callType: number = 0;

    static fromHttpResponse(response: {
        hash: string,
        nonce: number,
        value: string,
        receiver: string,
        sender: string,
        data: string,
        prevTxHash: string,
        originalTxHash: string,
        gasLimit: number,
        gasPrice: number,
        callType: number
    }): SmartContractResultItem {
        let item = new SmartContractResultItem();

        item.hash = new TransactionHash(response.hash);
        item.nonce = new Nonce(response.nonce || 0);
        item.value = Balance.fromString(response.value);
        item.receiver = new Address(response.receiver);
        item.sender = new Address(response.sender);
        item.dataTokens = response.data.split("@").map(item => Buffer.from(item, "hex")).filter(item => item.length > 0);
        item.previousHash = new TransactionHash(response.prevTxHash);
        item.originalHash = new TransactionHash(response.originalTxHash);
        item.gasLimit = new GasLimit(response.gasLimit);
        item.gasPrice = new GasPrice(response.gasPrice);
        item.callType = response.callType;

        return item;
    }
}

export class ImmediateResult extends SmartContractResultItem {
    /**
     * If available, will provide typed output arguments (with typed values).
     */
    private endpointDefinition?: EndpointDefinition;

    constructor(init?: Partial<ImmediateResult>) {
        super();
        Object.assign(this, init);
    }

    getReturnCode(): ReturnCode {
        let returnCodeToken = this.dataTokens[0];
        return ReturnCode.fromBuffer(returnCodeToken);
    }

    outputArguments(): Arguments {
        let argsToken = this.dataTokens.slice(1);
        let args = Arguments.fromBuffers(argsToken, this.endpointDefinition);
        return args;
    }

    setEndpointDefinition(endpointDefinition: EndpointDefinition) {
        this.endpointDefinition = endpointDefinition;
    }
}

export class ResultingCall extends SmartContractResultItem {
    constructor(init?: Partial<ResultingCall>) {
        super();
        Object.assign(this, init);
    }

    // TODO: Get as contract call (function, arguments).
    // TODO: Tests for ESDT, which call a built-in function.
}
