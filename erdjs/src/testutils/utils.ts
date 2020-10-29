import { describe, PendingSuiteFunction } from "mocha";
import { env } from "process";
import { ProxyProvider } from "../proxyProvider";

export function describeOnlyIf(environmentVariable: string): PendingSuiteFunction {
    let variable = env[environmentVariable];

    if (variable) {
        return describe.only;
    }

    return describe.skip;
}

export function getLocalTestnetProvider(): ProxyProvider {
    return new ProxyProvider("http://localhost:7950");
}

export function getMainnetProvider(): ProxyProvider {
    return new ProxyProvider("https://api.elrond.com");
}