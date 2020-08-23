import { errors } from ".";

const DENOMINATION = 18;
const OneEGLD = BigInt("1000000000000000000");

/**
 * Balance, as an immutable object
 */
export class Balance {
    private readonly value: bigint = BigInt(0);

    public constructor(value: bigint) {
        this.value = value;

        if (value < 0) {
            throw new errors.ErrBalanceInvalid(value);
        }
    }

    /**
     * Creates a balance object from an eGLD value (denomination will be applied)
     */
    static eGLD(value: number): Balance {
        return new Balance(BigInt(value) * OneEGLD);
    }

    /**
     * Creates a balance object from a string (with denomination included)
     */
    static fromString(value: string): Balance {
        return new Balance(BigInt(value));
    }

    static Zero(): Balance {
        return new Balance(BigInt(0));
    }

    raw(): string {
        return this.value.toString(); 
    }

    formatted(): string {
        let padded = this.raw().padStart(DENOMINATION, "0");
        let decimals = padded.slice(-DENOMINATION);
        let integer = padded.slice(0, padded.length - DENOMINATION);
        return `${integer}.${decimals} eGLD`;
    }
}
