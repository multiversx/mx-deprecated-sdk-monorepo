import { ContractFunction } from "./function";
import { Argument } from "./argument";
import { Balance } from "../balance";
import { Address } from "../address";
import { guardValueIsSet } from "../utils";
import { GasLimit } from "../networkParams";
import * as errors from "../errors";
import { EndpointDefinition, TypedValue } from "./typesystem";
import { Outcome } from "./outcome";

const MaxUint64 = BigInt("18446744073709551615");

export class Query {
    caller: Address;
    address: Address;
    func: ContractFunction;
    args: Argument[];
    value: Balance;

    constructor(init?: Partial<Query>) {
        this.caller = new Address();
        this.address = new Address();
        this.func = ContractFunction.none();
        this.args = [];
        this.value = Balance.Zero();

        Object.assign(this, init);

        guardValueIsSet("address", this.address);
        guardValueIsSet("func", this.func);

        this.address.assertNotEmpty();
        this.args = this.args || [];
        this.caller = this.caller || new Address();
        this.value = this.value || Balance.Zero();
    }

    toHttpRequest() {
        let request: any = {
            "ScAddress": this.address.bech32(),
            "FuncName": this.func.toString(),
            "Args": this.args.map(arg => arg.valueOf()),
            "CallValue": this.value.toString()
        };

        if (!this.caller.isEmpty()) {
            request["CallerAddr"] = this.caller.bech32();
        }

        return request;
    }
}

// TODO: extract to separate file!
export class QueryResponse {
    /**
     * If available, will provide a typed outcome (with typed values).
     */
    private endpointDefinition?: EndpointDefinition;

    returnData: string[];
    returnCode: string;
    returnMessage: string;
    gasUsed: GasLimit;

    constructor(init?: Partial<QueryResponse>) {
        this.returnData = init?.returnData || [];
        this.returnCode = init?.returnCode || "";
        this.returnMessage = init?.returnMessage || "";
        this.gasUsed = init?.gasUsed || GasLimit.min();
    }

    /**
     * Constructs a QueryResponse object from a HTTP response (as returned by the provider).
     */
    static fromHttpResponse(payload: any): QueryResponse {
        let returnData = <string[]>payload["returnData"] || payload["ReturnData"];
        let returnCode = payload["returnCode"] || payload["ReturnCode"];
        let returnMessage = payload["returnMessage"] || payload["ReturnMessage"];
        let gasRemaining = BigInt(payload["gasRemaining"] || payload["GasRemaining"] || 0);
        let gasUsed = new GasLimit(Number(MaxUint64 - gasRemaining));

        return new QueryResponse({
            returnData: returnData,
            returnCode: returnCode,
            returnMessage: returnMessage,
            gasUsed: gasUsed
        });
    }

    assertSuccess() {
        if (this.isSuccess()) {
            return;
        }

        throw new errors.ErrContract(`${this.returnCode}: ${this.returnMessage}`);
    }

    isSuccess(): boolean {
        let ok = this.returnCode == "ok" || this.returnCode == "0";
        return ok;
    }

    setEndpointDefinition(endpointDefinition: EndpointDefinition) {
        this.endpointDefinition = endpointDefinition;
    }

    outcome(): Outcome {
        return Outcome.fromQueryResponse(this.returnData, this.endpointDefinition);
    }

    /**
     * Converts the object to a pretty, plain JavaScript object.
     */
    toJSON(): object {
        return {
            success: this.isSuccess(),
            returnData: this.returnData,
            returnCode: this.returnCode,
            returnMessage: this.returnMessage,
            gasUsed: this.gasUsed.valueOf()
        };
    }
}
