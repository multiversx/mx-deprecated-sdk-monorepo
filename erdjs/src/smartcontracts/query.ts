import { ContractFunction } from "./function";
import { Argument } from "./argument";
import { Balance } from "../balance";
import { Address } from "../address";
import { guardValueIsSet } from "../utils";
import { GasLimit } from "../networkParams";
import * as errors from "../errors";

const MaxUint64 = BigInt("18446744073709551615");

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
        let request: any = {
            "ScAddress": this.contractAddress.bech32(),
            "FuncName": this.contractFunction.toString(),
            "Arguments": [] // TODO: Add arguments.
        };

        if (this.value) {
            request["CallValue"] = this.value.raw();
        }
        if (this.caller) {
            request["CallerAddr"] = this.caller.bech32();
        }

        return request;
    }
}

export class QueryResponse {
    private vmOutput: any;

    returnData: ContractReturnData[] = [];
    returnCode: string = "";
    returnMessage: string = "";
    gasUsed: GasLimit = GasLimit.min();

    /**
     * Constructs a QueryResponse object from a HTTP response (as returned by the provider).
     */
    static fromHttpResponse(payload: any): QueryResponse {
        let result = new QueryResponse();

        result.vmOutput = payload;
        result.returnData = ContractReturnData.fromArray(payload["returnData"] || []);
        result.returnCode = payload["returnCode"] || "";
        result.returnMessage = payload["returnMessage"] || "";

        let gasRemaining = BigInt(payload["gasRemaining"] || 0);
        let gasUsed = MaxUint64 - gasRemaining;
        result.gasUsed = new GasLimit(Number(gasUsed));

        return result;
    }

    assertSuccess() {
        if (this.isSuccess()) {
            return;
        }

        throw new errors.ErrContract(`${this.returnCode}: ${this.returnMessage}`);
    }

    isSuccess(): boolean {
        let ok = this.returnCode == "ok";
        return ok;
    }

    firstResult(): ContractReturnData {
        let first = this.returnData[0];
        return first;
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
            gasUsed: this.gasUsed.value
        };
    }
}


export class ContractReturnData {
    raw: any;
    asHex: string;
    asNumber: number;
    asString: string;

    constructor(raw: any) {
        let buffer = Buffer.from(raw, "base64");

        this.raw = raw;
        this.asHex = buffer.toString("hex");
        this.asNumber = parseInt(this.asHex, 16) || 0;
        this.asString = buffer.toString();
    }

    static fromArray(raw: any[]): ContractReturnData[] {
        let result = raw.map(item => new ContractReturnData(item));
        return result;
    }
}
