import  * as errors from "../errors";

export class ContractFunction {
    readonly name: string;

    constructor(name: string) {
        this.name = name;

        if (name.length == 0) {
            throw new errors.ErrInvalidFunctionName();
        }
    }
}