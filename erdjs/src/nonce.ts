import { errors } from ".";

export class Nonce {
    public readonly value: number;

    constructor(value: number) {
        value = Number(value);
        
        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrNonceInvalid(value);
        }

        this.value = value;
    }
}
