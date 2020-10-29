import { describe, PendingSuiteFunction } from "mocha";
import { env } from "process";

export function describeOnlyIf(environmentVariable: string): PendingSuiteFunction {
    let variable = env[environmentVariable];

    if (variable) {
        return describe.only;
    }

    return describe.skip;
}