import * as errors from "./errors";
import { BigNumber } from "bignumber.js";

/**
 * The number of decimals handled when working with eGLD values.
 */
const DENOMINATION = 18;

/**
 * One eGLD, in its big-integer form (as a string).
 */
const OneEGLDString = "1000000000000000000";

BigNumber.set({ DECIMAL_PLACES: DENOMINATION, ROUNDING_MODE: 1 });

/**
 * Balance, as an immutable object.
 */
export class Balance {
    private readonly value: bigint = BigInt(0);

    /**
     * Creates a Balance object.
     */
    public constructor(value: bigint) {
        this.value = value;

        if (value < 0) {
            throw new errors.ErrBalanceInvalid(value);
        }
    }

    /**
     * Creates a balance object from an eGLD value (denomination will be applied).
     */
    static eGLD(value: any): Balance {
        let bigGold = new BigNumber(value);
        let bigUnits = bigGold.multipliedBy(new BigNumber(OneEGLDString));
        let bigUnitsString = bigUnits.integerValue().toString(10);
        let bigIntUnits = BigInt(bigUnitsString);

        return new Balance(bigIntUnits);
    }

    /**
     * Creates a balance object from a string (with denomination included).
     */
    static fromString(value: string): Balance {
        return new Balance(BigInt(value));
    }

    /**
     * Creates a zero-valued balance object.
     */
    static Zero(): Balance {
        return new Balance(BigInt(0));
    }

    /**
     * Returns the string representation of the value (as eGLD currency).
     */
    toCurrencyString(): string {
        let padded = this.toString().padStart(DENOMINATION, "0");
        let decimals = padded.slice(-DENOMINATION);
        let integer = padded.slice(0, padded.length - DENOMINATION);
        return `${integer}.${decimals} eGLD`;
    }

    /**
     * Returns the string representation of the value (its big-integer form).
     */
    toString(): string {
        return this.value.toString();
    }

    /**
     * Converts the balance to a pretty, plain JavaScript object.
     */
    toJSON(): object {
        return {
            asString: this.toString(),
            asCurrencyString: this.toCurrencyString()
        };
    }

    valueOf(): bigint {
        return this.value;
    }
}
