
import { TransactionPayload } from "../transactionPayload";
import { guardValueIsSet } from "../utils";

import { appendArguments, Argument } from "./argument";
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
        data = appendArguments(data, this.arguments);

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
        data = appendArguments(data, this.arguments);

        return new TransactionPayload(data);
    }
}

export class ContractCallPayloadBuilder {
    private contractFunction: ContractFunction | null = null;
    private arguments: Argument[] = [];

    setFunction (contractFunction: ContractFunction): ContractCallPayloadBuilder {
        this.contractFunction = contractFunction;
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
        guardValueIsSet("calledFunction", this.contractFunction);

        let data = this.contractFunction!.name;
        data = appendArguments(data, this.arguments);

        return new TransactionPayload(data);
    }
}
