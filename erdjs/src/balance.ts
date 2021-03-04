import * as errors from "./errors";
import { BigNumber } from "bignumber.js";

/**
 * The base used for toString methods to avoid exponential notation
 */
const BASE_10 = 10;

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
    private readonly value: BigNumber = new BigNumber(0);

    /**
     * Creates a Balance object.
     */
    public constructor(value: string) {
        this.value = new BigNumber(value);

        if (this.value.isNegative()) {
            throw new errors.ErrBalanceInvalid(this.value);
        }
    }

    /**
     * Creates a balance object from an eGLD value (denomination will be applied).
     */
    static eGLD(value: any): Balance {
        let bigGold = new BigNumber(value);
        let bigUnits = bigGold.multipliedBy(new BigNumber(OneEGLDString));
        let bigUnitsString = bigUnits.integerValue().toString(BASE_10);

        return new Balance(bigUnitsString);
    }

    /**
     * Creates a balance object from a string (with denomination included).
     */
    static fromString(value: string): Balance {
        return new Balance(value || "0");
    }

    /**
     * Creates a zero-valued balance object.
     */
    static Zero(): Balance {
        return new Balance('0');
    }

    isZero(): boolean {
        return this.value.isZero();
    }

    isSet(): boolean {
        return !this.isZero();
    }

    /**
     * Returns the string representation of the value (as eGLD currency).
     */
    toCurrencyString(): string {
        let denominated = this.toDenominated();
        return `${denominated} eGLD`;
    }

    toDenominated(): string {
        let padded = this.toString().padStart(DENOMINATION, "0");
        let decimals = padded.slice(-DENOMINATION);
        let integer = padded.slice(0, padded.length - DENOMINATION) || 0;
        return `${integer}.${decimals}`;
    }

    /**
     * Returns the string representation of the value (its big-integer form).
     */
    toString(): string {
        return this.value.toString(BASE_10);
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

    valueOf(): BigNumber {
        return this.value;
    }
}
