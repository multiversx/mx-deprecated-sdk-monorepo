import * as valid from "./validation";
import * as errors from "./errors";
import { Signer, Signable, Provider } from "../providers/interface";
import { Transaction } from "./transaction";

export class SmartContractCall extends Transaction {
    private functionName: string = "";
    private arguments: string[] = [];

    constructor(data: any) {
        super(data);
        this.arguments = [];
    }

    public flattenData(): string {
        // TODO ensure even length of every argument
        return "";
    }

    public setFunctionName(functionName: string) {
        this.functionName = valid.FunctionName(functionName);
    }

    public addRawArgument(arg: string) {
        if (arg.length == 0) {
            throw errors.ErrInvalidArgument;
        }
        arg = this.ensureEvenLength(arg);
        this.arguments.push(arg);
    }

    public addBigIntArgument(arg: bigint) {
        let argStr = arg.toString(16); 
        argStr = this.ensureEvenLength(argStr);
        this.arguments.push(argStr);
    }

    public getArguments(): string[] {
        return this.arguments;
    }

    public ensureEvenLength(arg: string): string {
        if (arg.length % 2 != 0) {
            arg = "0" + arg;
        }
        return arg;
    }
}
