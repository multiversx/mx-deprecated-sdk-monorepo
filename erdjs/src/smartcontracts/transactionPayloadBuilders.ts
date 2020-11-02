
import { TransactionPayload } from "../transactionPayload";
import { guardValueIsSet } from "../utils";

import { appendArguments, Argument } from "./argument";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { ContractFunction } from "./function";

export const ArwenVirtualMachine = "0500";

/**
 * A builder for {@link TransactionPayload} objects, to be used for Smart Contract deployment transactions.
 */
export class ContractDeployPayloadBuilder {
    private code: Code | null = null;
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private arguments: Argument[] = [];

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
    addInitArg(arg: Argument): ContractDeployPayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    /**
     * Sets constructor (`init`) arguments.
     */
    setInitArgs(args: Argument[]): ContractDeployPayloadBuilder {
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
        data = appendArguments(data, this.arguments);

        return new TransactionPayload(data);
    }
}

/**
 * A builder for {@link TransactionPayload} objects, to be used for Smart Contract upgrade transactions.
 */
export class ContractUpgradePayloadBuilder {
    private code: Code | null = null;
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private arguments: Argument[] = [];

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
    addInitArg(arg: Argument): ContractUpgradePayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    /**
     * Sets upgrade (`init`) arguments.
     */
    setInitArgs(args: Argument[]): ContractUpgradePayloadBuilder {
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
        data = appendArguments(data, this.arguments);

        return new TransactionPayload(data);
    }
}

/**
 * A builder for {@link TransactionPayload} objects, to be used for Smart Contract execution transactions.
 */
export class ContractCallPayloadBuilder {
    private contractFunction: ContractFunction | null = null;
    private arguments: Argument[] = [];

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
    addArg(arg: Argument): ContractCallPayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    /**
     * Sets the function arguments.
     */
    setArgs(args: Argument[]): ContractCallPayloadBuilder {
        this.arguments = args;
        return this;
    }

    /**
     * Builds the {@link TransactionPayload}.
     */
    build(): TransactionPayload {
        guardValueIsSet("calledFunction", this.contractFunction);

        let data = this.contractFunction!.name;
        data = appendArguments(data, this.arguments);

        return new TransactionPayload(data);
    }
}
