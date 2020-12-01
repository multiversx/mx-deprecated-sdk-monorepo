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
            "CallValue": this.value.raw()
        };

        if (!this.caller.isEmpty()) {
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
        result.returnData = ContractReturnData.fromArray(payload["returnData"] || payload["ReturnData"] || []);
        result.returnCode = payload["returnCode"] || (payload["ReturnCode"]).toString() || "";
        result.returnMessage = payload["returnMessage"] || payload["ReturnMessage"] || "";

        let gasRemaining = BigInt(payload["gasRemaining"] || payload["GasRemaining"] || 0);
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
        let ok = this.returnCode == "ok" || this.returnCode == "0";
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
            gasUsed: this.gasUsed.valueOf()
        };
    }
}

// TODO: use types & codecs
export class ContractReturnData {
    asBuffer: Buffer;
    asBase64: any;
    asHex: string;
    asNumber: number;
    asBool: boolean;
    asBigInt: BigInt;
    asString: string;

    constructor(asBase64: any) {
        this.asBase64 = asBase64;
        this.asBuffer = Buffer.from(asBase64, "base64");
        this.asHex = this.asBuffer.toString("hex");
        this.asNumber = parseInt(this.asHex, 16) || 0;
        this.asBool = this.asNumber != 0;
        this.asBigInt = BigInt(`0x${this.asHex || "00"}`);
        this.asString = this.asBuffer.toString();
    }

    static fromArray(raw: any[]): ContractReturnData[] {
        let result = raw.map(item => new ContractReturnData(item));
        return result;
    }
}
