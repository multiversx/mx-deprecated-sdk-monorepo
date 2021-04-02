import { GasLimit } from "../networkParams";
import * as errors from "../errors";
import { EndpointDefinition, TypedValue } from "./typesystem";
import { MaxUint64 } from "./query";
import { ReturnCode } from "./returnCode";
import { guardValueIsSet } from "../utils";
import { ArgSerializer } from "./argSerializer";
import BigNumber from "bignumber.js";

export class QueryResponse {
    /**
     * If available, will provide typed output arguments (with typed values).
     */
    private endpointDefinition?: EndpointDefinition;

    returnData: string[];
    returnCode: ReturnCode;
    returnMessage: string;
    gasUsed: GasLimit;

    constructor(init?: Partial<QueryResponse>) {
        this.returnData = init?.returnData || [];
        this.returnCode = init?.returnCode || ReturnCode.Unknown;
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
        let gasRemaining = new BigNumber(payload["gasRemaining"] || payload["GasRemaining"] || 0);
        let gasUsed = new GasLimit(MaxUint64.minus(gasRemaining).toNumber());

        return new QueryResponse({
            returnData: returnData,
            returnCode: new ReturnCode(returnCode),
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
        return this.returnCode.equals(ReturnCode.Ok);
    }

    setEndpointDefinition(endpointDefinition: EndpointDefinition) {
        this.endpointDefinition = endpointDefinition;
    }

    outputUntyped(): Buffer[] {
        this.assertSuccess();

        let buffers = this.returnData.map(item => Buffer.from(item, "base64"));
        return buffers;
    }

    outputTyped(): TypedValue[] {
        this.assertSuccess();
        guardValueIsSet("endpointDefinition", this.endpointDefinition);

        let buffers = this.outputUntyped();
        let values = new ArgSerializer().buffersToValues(buffers, this.endpointDefinition!.output);
        return values;
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
