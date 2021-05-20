import * as errors from "./errors";
import { BigNumber } from "bignumber.js";
import { ESDTToken, TokenType } from "./esdtToken";

/**
 * The base used for toString methods to avoid exponential notation
 */
const BASE_10 = 10;

/**
 * The number of decimals handled when working with EGLD or ESDT values.
 */
const DEFAULT_BIGNUMBER_DECIMAL_PLACES = 18;


BigNumber.set({ DECIMAL_PLACES: DEFAULT_BIGNUMBER_DECIMAL_PLACES, ROUNDING_MODE: 1 });

/**
 * Balance, as an immutable object.
 */
export class Balance {
    readonly token: ESDTToken;
    private readonly nonce: BigNumber = new BigNumber(0);
    private readonly value: BigNumber = new BigNumber(0);

    /**
     * Creates a Balance object.
     */
    public constructor(token: ESDTToken, nonce: BigNumber.Value, value: BigNumber.Value) {
        this.token = token;
        this.nonce = new BigNumber(nonce);
        this.value = new BigNumber(value);

        if (this.value.isNegative()) {
            throw new errors.ErrBalanceInvalid(this.value);
        }
    }

    /**
     * Creates a balance object from an EGLD value (denomination will be applied).
     */
    static egld(value: BigNumber.Value): Balance {
        return Egld(value);
    }

    /**
     * Creates a balance object from a string (with denomination included).
     */
    static fromString(value: string): Balance {
        return Egld.raw(value || "0");
    }

    /**
     * Creates a zero-valued EGLD balance object.
     */
    static Zero(): Balance {
        return Egld(0);
    }

    isZero(): boolean {
        return this.value.isZero();
    }

    isEgld(): boolean {
        return this.token.isEgld();
    }

    isSet(): boolean {
        return !this.isZero();
    }

    /**
     * Returns the string representation of the value (as EGLD currency).
     */
    toCurrencyString(): string {
        let denominated = this.toDenominated();
        return `${denominated} ${this.token.name}`;
    }

    toDenominated(): string {
        let padded = this.toString().padStart(this.token.decimals, "0");
        let decimals = padded.slice(-this.token.decimals);
        let integer = padded.slice(0, padded.length - this.token.decimals) || 0;
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

    getNonce(): BigNumber {
        return this.nonce;
    }

    valueOf(): BigNumber {
        return this.value;
    }
}

/**
 * Builder for an EGLD value.
 */
export const Egld = FungibleToken("EGLD", 18);

/**
 * Creates a builder function for Fungible Tokens (FT) balances.
 */
export function FungibleToken(name: string, decimals: number): FungibleBalanceBuilder {
    let token = createToken(name, decimals, TokenType.SemiFungibleESDT);
    return getBoundFungibleBuilder(token);
}

interface FungibleBalanceBuilder {
    (value: BigNumber.Value): Balance;
    raw(value: BigNumber.Value): Balance;
    readonly token: ESDTToken;
}

function getBoundFungibleBuilder(token: ESDTToken): FungibleBalanceBuilder {
    let denominated = buildFungibleBalance.bind(null, token, true);
    let raw = buildFungibleBalance.bind(null, token, false);
    return Object.assign(denominated, { raw: raw, token: token });
}

function buildFungibleBalance(token: ESDTToken, withDenomination: boolean, value: BigNumber.Value): Balance {
    return buildBalance(token, withDenomination, 0, value);
}

/**
 * Creates a builder function for Semi-Fungible Token (SFT) balances.
 */
export function SemiFungibleToken(name: string, decimals: number): SemiFungibleBalanceBuilder {
    let token = createToken(name, decimals, TokenType.SemiFungibleESDT);
    return getBoundSemiFungibleBuilder(token);
}

interface SemiFungibleBalanceBuilder {
    (value: BigNumber.Value, nonce: BigNumber.Value): Balance;
    raw(value: BigNumber.Value, nonce: BigNumber.Value): Balance;
    readonly token: ESDTToken;
}

function getBoundSemiFungibleBuilder(token: ESDTToken): SemiFungibleBalanceBuilder {
    let denominated = buildSemiFungibleBalance.bind(null, token, true);
    let raw = buildSemiFungibleBalance.bind(null, token, false);
    return Object.assign(denominated, { raw: raw, token: token });
}

function buildSemiFungibleBalance(token: ESDTToken, withDenomination: boolean, value: BigNumber.Value, nonce: BigNumber.Value) {
    return buildBalance(token, withDenomination, nonce, value);
}

/**
 * Creates a builder function for Non-Fungible Token (NFT) balances.
 */
export function NonFungibleToken(name: string, decimals: number): NonFungibleBalanceBuilder {
    let token = createToken(name, decimals, TokenType.NonFungibleESDT);
    return getBoundNonFungibleBuilder(token);
}

interface NonFungibleBalanceBuilder {
    (nonce: BigNumber.Value): Balance;
    raw(nonce: BigNumber.Value): Balance;
    readonly token: ESDTToken;
}

function getBoundNonFungibleBuilder(token: ESDTToken): NonFungibleBalanceBuilder {
    let raw = buildNonFungibleBalance.bind(null, token, false);
    return Object.assign(raw, { raw: raw, token: token });
}

function buildNonFungibleBalance(token: ESDTToken, withDenomination: boolean, nonce: BigNumber.Value) {
    return buildBalance(token, withDenomination, nonce, 1);
}

function precisionMultiplier(decimals: number): BigNumber {
    return new BigNumber(10).pow(decimals);
}

function buildBalance(token: ESDTToken, withDenomination: boolean, nonce: BigNumber.Value, value: BigNumber.Value) {
    if (withDenomination) {
        return convertDenominationToBalance(token, nonce, value);
    }
    return new Balance(token, nonce, value);
}

function convertDenominationToBalance(token: ESDTToken, nonce: BigNumber.Value, value: BigNumber.Value): Balance {
    let bigNumberValue = new BigNumber(value);
    let precision = precisionMultiplier(token.decimals);
    let units = bigNumberValue.multipliedBy(precision);
    let unitsString = units.integerValue().toString(BASE_10);

    return new Balance(token, nonce, unitsString);
}

function createToken(name: string, decimals: number, type: TokenType): ESDTToken {
    return new ESDTToken({
        name: name,
        type: type,
        decimals: decimals,
    });
}
