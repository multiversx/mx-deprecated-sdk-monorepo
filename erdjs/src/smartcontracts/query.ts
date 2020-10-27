import { ContractFunction } from "./function";
import { Argument } from "./argument";
import { Balance } from "../balance";
import { Address } from "../address";
import { guardValueIsSet } from "../utils";

export class Query {
    caller: Address;
    contractAddress: Address;
    contractFunction: ContractFunction;
    arguments: Argument[];
    value: Balance;

    constructor(init?: Partial<Query>) {
        this.caller = new Address();
        this.contractAddress = new Address();
        this.contractFunction = ContractFunction.none();
        this.arguments = [];
        this.value = Balance.Zero();

        Object.assign(this, init);

        guardValueIsSet("contractAddress", this.contractAddress);
        guardValueIsSet("contractFunction", this.contractFunction);

        this.contractAddress.assertNotEmpty();
    }

    toHttpRequest() {
        return {
            "ScAddress": this.contractAddress.bech32(),
            "FuncName": this.contractFunction.toString(),
            "CallerAddr": this.caller.isEmpty() ? "" : this.caller.bech32(),
            "CallValue": this.value.raw(),
            "Arguments": []
        };
    }
}

export class QueryResponse {
    /**
     * Constructs a QueryResponse object from a HTTP response (as returned by the provider).
     */
    static fromHttpResponse(_payload: any): QueryResponse {
        return new QueryResponse();
    }
}