import { ErrInvalidArgument } from "../../errors";
import { ArgSerializer } from "../argSerializer";
import { ContractFunction } from "../function";
import { EndpointDefinition, TypedValue } from "../typesystem";


/**
 * Creates a FormattedCall from the given endpoint and args.
 */
export function formatEndpoint(endpoint: EndpointDefinition, ...args: any[]): FormattedCall {
    return new FormattedCall(endpoint, args);
}

/**
 * Formats and validates the arguments of a bound call.
 * A bound call is represented by a function and its arguments packed together.
 * A function is defined as something that has an EndpointDefinition and may be:
 * - a smart contract method
 * - a system function (such as an ESDT transfer)
 */
export class FormattedCall {
    private readonly endpoint: EndpointDefinition;
    private readonly args: any[];

    /**
     * 
     */
    constructor(endpoint: EndpointDefinition, args: any[]) {
        this.endpoint = endpoint;
        this.args = args;
    }

    getFunction(): ContractFunction {
        return new ContractFunction(this.endpoint.name);
    }

    /**
     * Takes the given arguments, and converts them to typed values, validating them against the given endpoint in the process.
     */
    toTypedValues(): TypedValue[] {
        let expandedArgs = this.getExpandedArgs();
        return ArgSerializer.nativeToTypedValues(expandedArgs, this.endpoint);
    }

    toArgBuffers(): Buffer[] {
        let typedValues = this.toTypedValues();
        return new ArgSerializer().valuesToBuffers(typedValues);
    }

    /**
     * Formats the function name and its arguments as an array of buffers.
     * This is useful for nested calls (for the multisig smart contract or for ESDT transfers).
     * A formatted deploy call does not return the function name.
     */
    toCallBuffers(): Buffer[] {
        if (this.endpoint.isConstructor()) {
            return this.toArgBuffers();
        }
        return [Buffer.from(this.endpoint.name), ...this.toArgBuffers()];
    }

    private getExpandedArgs(): any[] {
        let expanded: any[] = [];
        for (let value of this.args) {
            if (value instanceof FormattedCall) {
                expanded = expanded.concat(value.toCallBuffers());
            } else {
                expanded.push(value);
            }
        }
        return expanded;
    }
}
