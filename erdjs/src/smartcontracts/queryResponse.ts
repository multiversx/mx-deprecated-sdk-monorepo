import { GasLimit } from "../networkParams";
import * as errors from "../errors";
import { EndpointDefinition } from "./typesystem";
import { Arguments } from "./arguments";
import { MaxUint64 } from "./query";

export class QueryResponse {
    /**
     * If available, will provide typed output arguments (with typed values).
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

    outputArguments(): Arguments {
        return Arguments.fromQueryResponse(this.returnData, this.endpointDefinition);
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
