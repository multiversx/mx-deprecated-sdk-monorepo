import { GasLimit } from "../networkParams";
import * as errors from "../errors";
import { EndpointDefinition } from "./typesystem";
import { Arguments } from "./arguments";
import { MaxUint64 } from "./query";
import { ReturnCode } from "./returnCode";

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
        let gasRemaining = BigInt(payload["gasRemaining"] || payload["GasRemaining"] || 0);
        let gasUsed = new GasLimit(Number(MaxUint64 - gasRemaining));

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
