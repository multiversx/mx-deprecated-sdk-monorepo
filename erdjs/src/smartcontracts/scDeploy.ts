import * as valid from "../data/validation";
import * as errors from "../errors";
import { Address } from "../account";
import { Signer, Signable, Provider } from "../providers/interface";
import { SmartContractCall } from "./scCall";

export class SmartContractDeploy extends SmartContractCall {
    protected vmType: string = "0500";
    protected code: string = "";
    protected codeMetadata: string = "0100";

    constructor() {
        super();
    }

    public generateArgumentString(): string {
        // TODO ensure even length of every argument
        let output = "";
        output += this.code;
        output += "@" + this.vmType;
        output += "@" + this.codeMetadata;
        for (let argument of this.arguments) {
            output += "@";
            output += this.ensureEvenLength(argument);
        }
        return output;
    }

    public setVMType(vmType: string) {
        this.vmType = valid.VMType(vmType);
    }

    public setCode(code: string) {
        this.code = valid.SCCode(code);
    }

    public setCodeMetadata(metadata: string) {
        this.codeMetadata = valid.SCCodeMetadata(metadata);
    }

    public getVMType(): string {
        return this.vmType;
    }
}

