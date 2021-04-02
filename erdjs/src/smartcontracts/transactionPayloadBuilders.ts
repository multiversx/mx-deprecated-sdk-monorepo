
import { TransactionPayload } from "../transactionPayload";
import { guardValueIsSet } from "../utils";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { ContractFunction } from "./function";
import { ArgSerializer } from "./argSerializer";
import { TypedValue } from "./typesystem";

export const ArwenVirtualMachine = "0500";

/**
 * A builder for {@link TransactionPayload} objects, to be used for Smart Contract deployment transactions.
 */
export class ContractDeployPayloadBuilder {
    private code: Code | null = null;
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private arguments: TypedValue[] = [];

    /**
     * Sets the code of the Smart Contract.
     */
    setCode(code: Code): ContractDeployPayloadBuilder {
        this.code = code;
        return this;
    }

    /**
     * Sets the code metadata of the Smart Contract.
     */
    setCodeMetadata(codeMetadata: CodeMetadata): ContractDeployPayloadBuilder {
        this.codeMetadata = codeMetadata;
        return this;
    }

    /**
     * Adds constructor (`init`) arguments.
     */
    addInitArg(arg: TypedValue): ContractDeployPayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    /**
     * Sets constructor (`init`) arguments.
     */
    setInitArgs(args: TypedValue[]): ContractDeployPayloadBuilder {
        this.arguments = args;
        return this;
    }

    /**
     * Builds the {@link TransactionPayload}.
     */
    build(): TransactionPayload {
        guardValueIsSet("code", this.code);

        let code = this.code!.toString();
        let codeMetadata = this.codeMetadata.toString();
        let data = `${code}@${ArwenVirtualMachine}@${codeMetadata}`;
        data = appendArgumentsToString(data, this.arguments);

        return new TransactionPayload(data);
    }
}

/**
 * A builder for {@link TransactionPayload} objects, to be used for Smart Contract upgrade transactions.
 */
export class ContractUpgradePayloadBuilder {
    private code: Code | null = null;
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private arguments: TypedValue[] = [];

    /**
     * Sets the code of the Smart Contract.
     */
    setCode(code: Code): ContractUpgradePayloadBuilder {
        this.code = code;
        return this;
    }

    /**
     * Sets the code metadata of the Smart Contract.
     */
    setCodeMetadata(codeMetadata: CodeMetadata): ContractUpgradePayloadBuilder {
        this.codeMetadata = codeMetadata;
        return this;
    }

    /**
     * Adds upgrade (`init`) arguments.
     */
    addInitArg(arg: TypedValue): ContractUpgradePayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    /**
     * Sets upgrade (`init`) arguments.
     */
    setInitArgs(args: TypedValue[]): ContractUpgradePayloadBuilder {
        this.arguments = args;
        return this;
    }

    /**
     * Builds the {@link TransactionPayload}.
     */
    build(): TransactionPayload {
        guardValueIsSet("code", this.code);

        let code = this.code!.toString();
        let codeMetadata = this.codeMetadata.toString();
        let data = `upgradeContract@${code}@${codeMetadata}`;
        data = appendArgumentsToString(data, this.arguments);

        return new TransactionPayload(data);
    }
}

/**
 * A builder for {@link TransactionPayload} objects, to be used for Smart Contract execution transactions.
 */
export class ContractCallPayloadBuilder {
    private contractFunction: ContractFunction | null = null;
    private arguments: TypedValue[] = [];

    /**
     * Sets the function to be called (executed).
     */
    setFunction (contractFunction: ContractFunction): ContractCallPayloadBuilder {
        this.contractFunction = contractFunction;
        return this;
    }

    /**
     * Adds a function argument.
     */
    addArg(arg: TypedValue): ContractCallPayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    /**
     * Sets the function arguments.
     */
    setArgs(args: TypedValue[]): ContractCallPayloadBuilder {
        this.arguments = args;
        return this;
    }

    /**
     * Builds the {@link TransactionPayload}.
     */
    build(): TransactionPayload {
        guardValueIsSet("calledFunction", this.contractFunction);

        let data = this.contractFunction!.name;
        data = appendArgumentsToString(data, this.arguments);

        return new TransactionPayload(data);
    }
}

function appendArgumentsToString(to: string, values: TypedValue[]) {
    if (values.length == 0) {
        return to;
    }

    let serializer = new ArgSerializer();
    let argumentsString = serializer.valuesToString(values);
    return `${to}@${argumentsString}`;
}
