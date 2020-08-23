import * as valid from "../utils";
import * as errors from "../errors";
import { Transaction } from "../transaction";

export class SmartContractCall extends Transaction {
    protected functionName: string = "";
    protected arguments: string[] = [];

    constructor() {
        super();
        //this.arguments = [];
    }

    public prepareData() {
        //this.setData(this.generateArgumentString());
        console.log("SmartContractCall data:\t", this.data);
    }

    public generateArgumentString(): string {
        // TODO ensure even length of every argument
        let output = "";
        output += this.functionName;
        for (let argument of this.arguments) {
            output += "@";
            output += this.ensureEvenLength(argument);
        }
        return output;
    }

    public setFunctionName(functionName: string) {
        this.functionName = valid.FunctionName(functionName);
    }

    public addRawArgument(argument: string) {
        if (argument.length == 0) {
            throw errors.ErrInvalidArgument;
        }
        this.arguments.push(argument);
    }

    public addBigIntArgument(argument: bigint) {
        this.arguments.push(argument.toString(16));
    }

    public getArguments(): string[] {
        return this.arguments;
    }

    public ensureEvenLength(argument: string): string {
        if (argument.length % 2 != 0) {
            argument = "0" + argument;
        }
        return argument;
    }
}
