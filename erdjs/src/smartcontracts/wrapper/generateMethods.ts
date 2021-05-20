import { SmartContractAbi } from "../abi";
import { EndpointDefinition } from "../typesystem";

export type EndpointHandler<ThisType, ReturnType> = (this: ThisType, endpoint: EndpointDefinition, ...args: any[]) => ReturnType;
export type Method<ReturnType> = (...args: any[]) => ReturnType;
export type Methods<ReturnType> = Record<string, Method<ReturnType>>;

export function generateMethods<ThisType, ReturnType>(this_: ThisType, abi: SmartContractAbi, endpointHandler: EndpointHandler<ThisType, ReturnType>): Methods<ReturnType> {
    let generated: Methods<ReturnType> = {};
    for (const endpoint of abi.getAllEndpoints()) {
        generated[endpoint.name] = endpointHandler.bind(this_, endpoint);
    }
    return generated;
}

export function addMethods<ReturnType>(object: { [key: string]: any; }, methods: Methods<ReturnType>) {
    for (const key in methods) {
        object[key] = methods[key];
    }
}
