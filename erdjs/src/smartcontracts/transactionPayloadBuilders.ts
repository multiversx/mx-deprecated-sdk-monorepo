
import { TransactionPayload } from "../transactionPayload";
import { guardValueIsSet } from "../utils";

import { Argument } from "./argument";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { ContractFunction } from "./function";

const ArwenVirtualMachine = "0500";

export class ContractDeployPayloadBuilder {
    private code: Code | null = null;
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private arguments: Argument[] = [];

    setCode(code: Code): ContractDeployPayloadBuilder {
        this.code = code;
        return this;
    }

    setCodeMetadata(codeMetadata: CodeMetadata): ContractDeployPayloadBuilder {
        this.codeMetadata = codeMetadata;
        return this;
    }

    addInitArgument(arg: Argument): ContractDeployPayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    setInitArguments(args: Argument[]): ContractDeployPayloadBuilder {
        this.arguments = args;
        return this;
    }

    build(): TransactionPayload {
        guardValueIsSet("code", this.code);

        let code = this.code!.toString();
        let codeMetadata = this.codeMetadata.toString();
        let data = `${code}@${ArwenVirtualMachine}@${codeMetadata}`;

        if (this.arguments.length > 0) {
            data += "@" + this.arguments.join("@");
        }

        return new TransactionPayload(data);
    }
}

export class ContractUpgradePayloadBuilder {
    private code: Code | null = null;
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private arguments: Argument[] = [];

    setCode(code: Code): ContractUpgradePayloadBuilder {
        this.code = code;
        return this;
    }

    setCodeMetadata(codeMetadata: CodeMetadata): ContractUpgradePayloadBuilder {
        this.codeMetadata = codeMetadata;
        return this;
    }

    addInitArgument(arg: Argument): ContractUpgradePayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    setInitArguments(args: Argument[]): ContractUpgradePayloadBuilder {
        this.arguments = args;
        return this;
    }
    
    build(): TransactionPayload {
        guardValueIsSet("code", this.code);

        let code = this.code!.toString();
        let codeMetadata = this.codeMetadata.toString();
        let data = `upgradeContract@${code}@${codeMetadata}`;

        if (this.arguments.length > 0) {
            data += "@" + this.arguments.join("@");
        }

        return new TransactionPayload(data);
    }
}

export class ContractCallPayloadBuilder {
    private calledFunction: ContractFunction | null = null;
    private arguments: Argument[] = [];

    setFunction (calledFunction: ContractFunction): ContractCallPayloadBuilder {
        this.calledFunction = calledFunction;
        return this;
    }

    addArgument(arg: Argument): ContractCallPayloadBuilder {
        this.arguments.push(arg);
        return this;
    }

    setArguments(args: Argument[]): ContractCallPayloadBuilder {
        this.arguments = args;
        return this;
    }

    build(): TransactionPayload {
        guardValueIsSet("calledFunction", this.calledFunction);

        let data = this.calledFunction?.toString();

        if (this.arguments.length > 0) {
            data += "@" + this.arguments.join("@");
        }

        return new TransactionPayload(data);
    }
}
