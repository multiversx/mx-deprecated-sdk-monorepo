import {TransactionPayload} from "./transactionPayload";
import {NetworkConfig} from "./networkConfig";
import * as errors from "./errors";
import {Balance} from "./balance";
import {
    TRANSACTION_OPTIONS_DEFAULT,
    TRANSACTION_OPTIONS_TX_HASH_SIGN,
    TRANSACTION_VERSION_DEFAULT, TRANSACTION_VERSION_TX_HASH_SIGN
} from "./constants";

/**
 * The gas price, as an immutable object.
 */
export class GasPrice {
    /**
     * The actual numeric value.
     */
    private readonly value: number;

    /**
     * Creates a GasPrice object given a value.
     */
    constructor(value: number) {
        value = Number(value);

        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrGasPriceInvalid(value);
        }

        this.value = value;
    }

    toDenominated(): string {
        let asBalance = new Balance(this.value.toString(10));
        return asBalance.toDenominated();
    }

    /**
     * Creates a GasPrice object using the minimum value.
     */
    static min(): GasPrice {
        let value = NetworkConfig.getDefault().MinGasPrice.value;
        return new GasPrice(value);
    }

    valueOf(): number {
        return this.value;
    }
}

/**
 * The gas limit, as an immutable object.
 */
export class GasLimit {
    /**
     * The actual numeric value.
     */
    private readonly value: number;

    /**
     * Creates a GasLimit object given a value.
     */
    constructor(value: number) {
        value = Number(value);

        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrGasLimitInvalid(value);
        }

        this.value = value;
    }

    /**
     * Creates a GasLimit object for a value-transfer {@link Transaction}.
     */
    static forTransfer(data: TransactionPayload): GasLimit {
        let value = NetworkConfig.getDefault().MinGasLimit.value;

        if (data) {
            value += NetworkConfig.getDefault().GasPerDataByte * data.length();
        }

        return new GasLimit(value);
    }

    /**
     * Creates a GasLimit object using the minimum value.
     */
    static min(): GasLimit {
        let value = NetworkConfig.getDefault().MinGasLimit.value;
        return new GasLimit(value);
    }

    valueOf(): number {
        return this.value;
    }
}


export class ChainID {
    /**
     * The actual value, as a string.
     */
    private readonly value: string;

    /**
     * Creates a ChainID object given a value.
     */
    constructor(value: string) {
        if (!value) {
            throw new errors.ErrChainIDInvalid(value);
        }

        this.value = value;
    }

    valueOf(): string {
        return this.value;
    }
}

export class TransactionVersion {
    /**
     * The actual numeric value.
     */
    private readonly value: number;

    /**
     * Creates a TransactionVersion object given a value.
     */
    constructor(value: number) {
        value = Number(value);

        if (value < 1) {
            throw new errors.ErrTransactionVersionInvalid(value);
        }

        this.value = value;
    }

    /**
     * Creates a TransactionVersion object with the default version setting
     */
    static withDefaultVersion(): TransactionVersion {
        return new TransactionVersion(TRANSACTION_VERSION_DEFAULT);
    }

    /**
     * Creates a TransactionVersion object with the VERSION setting for hash signing
     */
    static withTxHashSignVersion(): TransactionVersion {
        return new TransactionVersion(TRANSACTION_VERSION_TX_HASH_SIGN);
    }

    valueOf(): number {
        return this.value;
    }
}

export class TransactionOptions {
    /**
     * The actual numeric value.
     */
    private readonly value: number;

    /**
     * Creates a TransactionOptions object given a value.
     */
    constructor(value: number) {
        value = Number(value);

        if (value < 0) {
            throw new errors.ErrTransactionOptionsInvalid(value);
        }

        this.value = value;
    }

    /**
     * Creates a TransactionOptions object with the default options setting
     */
    static withDefaultOptions(): TransactionOptions {
        return new TransactionOptions(TRANSACTION_OPTIONS_DEFAULT);
    }

    /**
     * Created a TransactionsOptions object with the setting for hash signing
     */
    static withTxHashSignOptions(): TransactionOptions {
        return new TransactionOptions(TRANSACTION_OPTIONS_TX_HASH_SIGN);
    }

    valueOf(): number {
        return this.value;
    }
}

export class GasPriceModifier {
    /**
     * The actual numeric value.
     */
    private readonly value: number;

    /**
     * Creates a GasPriceModifier object given a value.
     */
    constructor(value: number) {
        value = Number(value);

        if (value <= 0 || value > 1) {
            throw new errors.ErrGasPriceModifierInvalid(value);
        }

        this.value = value;
    }

    valueOf(): number {
        return this.value;
    }
}
