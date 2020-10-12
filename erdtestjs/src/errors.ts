import { Err } from "@elrondnetwork/erdjs";

export class ErrExec extends Err {
    constructor({ program, code, message }: { program: string, code?: any, message?: string }) {
        let composedMessage = `program="${program}", code=[${code}]; [${message}]`;
        super(composedMessage);
    }
}

export class ErrContract extends Err {
    constructor(message: string) {
        super(`Contract execution error: ${message}`);
    }
}