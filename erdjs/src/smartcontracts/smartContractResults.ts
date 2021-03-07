import * as errors from "../errors";
import { Address } from "../address";
import { Balance } from "../balance";
import { Hash } from "../hash";
import { GasLimit, GasPrice } from "../networkParams";
import { Nonce } from "../nonce";
import { TransactionHash } from "../transaction";
import { Serializer } from "./serializer";
import { EndpointDefinition, TypedValue } from "./typesystem";
import { guardValueIsSet } from "../utils";
import { ReturnCode } from "./returnCode";
import { TransactionOnNetwork } from "../transactionOnNetwork";

export class SmartContractResults {
    private readonly items: SmartContractResultItem[] = [];
    private readonly immediate: ImmediateResult = new ImmediateResult();
    private readonly resultingCalls: ResultingCall[] = [];

    constructor(items: SmartContractResultItem[]) {
        this.items = items;

        if (this.items.length > 0) {
            this.immediate = this.findImmediateResult();
            this.resultingCalls = this.findResultingCalls();
        }
    }

    static empty(): SmartContractResults {
        return new SmartContractResults([]);
    }

    static fromHttpResponse(smartContractResults: any[]): SmartContractResults {
        let items = (smartContractResults || []).map((item: any) => SmartContractResultItem.fromHttpResponse(item));
        return new SmartContractResults(items);
    }

    private findImmediateResult(): ImmediateResult {
        let immediateItem = this.items[0];
        guardValueIsSet("immediateItem", immediateItem);
        return new ImmediateResult(immediateItem);
    }

    private findResultingCalls(): ResultingCall[] {
        let otherItems = this.items.slice(1);
        let resultingCalls = otherItems.map(item => new ResultingCall(item));
        return resultingCalls;
    }

    getImmediate(): ImmediateResult {
        return this.immediate;
    }

    getResultingCalls(): ResultingCall[] {
        return this.resultingCalls;
    }
}

export class SmartContractResultItem {
    hash: Hash = Hash.empty();
    nonce: Nonce = new Nonce(0);
    value: Balance = Balance.Zero();
    receiver: Address = new Address();
    sender: Address = new Address();
    data: string = "";
    previousHash: Hash = Hash.empty();
    originalHash: Hash = Hash.empty();
    gasLimit: GasLimit = new GasLimit(0);
    gasPrice: GasPrice = new GasPrice(0);
    callType: number = 0;
    returnMessage: string = "";

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
        callType: number,
        returnMessage: string
    }): SmartContractResultItem {
        let item = new SmartContractResultItem();

        item.hash = new TransactionHash(response.hash);
        item.nonce = new Nonce(response.nonce || 0);
        item.value = Balance.fromString(response.value);
        item.receiver = new Address(response.receiver);
        item.sender = new Address(response.sender);
        item.data = response.data || "";
        item.previousHash = new TransactionHash(response.prevTxHash);
        item.originalHash = new TransactionHash(response.originalTxHash);
        item.gasLimit = new GasLimit(response.gasLimit);
        item.gasPrice = new GasPrice(response.gasPrice);
        item.callType = response.callType;
        item.returnMessage = response.returnMessage;

        return item;
    }

    getDataTokens(): Buffer[] {
        let serializer = new Serializer();
        return serializer.stringToBuffers(this.data);
    }
}

export class ImmediateResult extends SmartContractResultItem {
    /**
     * If available, will provide typed output arguments (with typed values).
     */
    private endpointDefinition?: EndpointDefinition;

    constructor(init?: Partial<SmartContractResultItem>) {
        super();
        Object.assign(this, init);
    }

    assertSuccess() {
        if (this.isSuccess()) {
            return;
        }

        throw new errors.ErrContract(`${this.getReturnCode()}: ${this.returnMessage}`);
    }

    isSuccess(): boolean {
        return this.getReturnCode().equals(ReturnCode.Ok);
    }

    getReturnCode(): ReturnCode {
        // Question for review: is this correct? Is the first parameter of a SCR always void and unused? E.g.: @6f6b@2b.
        let returnCodeToken = this.getDataTokens()[1];
        return ReturnCode.fromBuffer(returnCodeToken);
    }


    outputUntyped(): Buffer[] {
        // Question for review: is this correct? Is the first parameter of a SCR always void and unused? E.g.: @6f6b@2b.
        return this.getDataTokens().slice(2);
    }

    outputTyped(): TypedValue[] {
        guardValueIsSet("endpointDefinition", this.endpointDefinition);

        let buffers = this.outputUntyped();
        let values = new Serializer().buffersToValues(buffers, this.endpointDefinition!.output);
        return values;
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
