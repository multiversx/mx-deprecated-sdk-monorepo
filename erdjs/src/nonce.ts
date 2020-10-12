import  * as errors from "./errors";

export class Nonce {
    value: number;

    constructor(value: number) {
        value = Number(value);
        
        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrNonceInvalid(value);
        }

        this.value = value;
    }

    increment(): Nonce {
        return new Nonce(this.value + 1);
    }
}
