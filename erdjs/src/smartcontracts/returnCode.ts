export class ReturnCode {
    static Ok = new ReturnCode("ok");
    static FunctionNotFound = new ReturnCode("function not found");
    static FunctionWrongSignature = new ReturnCode("wrong signature for function");
    static ContractNotFound = new ReturnCode("contract not found");
    static UserError = new ReturnCode("user error");
    static OutOfGas = new ReturnCode("out of gas");
    static AccountCollision = new ReturnCode("account collision");
    static OutOfFunds = new ReturnCode("out of funds");
    static CallStackOverFlow = new ReturnCode("call stack overflow");
    static ContractInvalid = new ReturnCode("contract invalid");
    static ExecutionFailed = new ReturnCode("execution failed");
    static Unknown = new ReturnCode("unknown");

    private readonly text: string;

    constructor(text: string) {
        this.text = text;
    }

    static fromBuffer(buffer: Buffer): ReturnCode {
        let text = buffer.toString();
        return new ReturnCode(text);
    }

    toString(): string {
        return this.text;
    }

    valueOf(): string {
        return this.text;
    }

    equals(other: ReturnCode): boolean {
        if (!other) {
            return false;
        }

        return this.text == other.text;
    }
}
