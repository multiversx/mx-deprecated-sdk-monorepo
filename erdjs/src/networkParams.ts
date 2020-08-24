import { errors } from ".";

export class GasPrice {
    public readonly value: number;

    constructor(value: number) {
        value = Number(value);
        
        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrGasPriceInvalid(value);
        }

        this.value = value;
    }
}

export class GasLimit {
    public readonly value: number;

    constructor(value: number) {
        value = Number(value);
        
        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrGasLimitInvalid(value);
        }

        this.value = value;
    }
}


export class ChainID {
    public readonly value: string;

    constructor(value: string) {
        if (!value) {
            throw new errors.ErrChainIDInvalid(value);
        }

        this.value = value;
    }
}

export class TransactionVersion {
    public readonly value: number;

    constructor(value: number) {
        value = Number(value);
        
        if (value < 1) {
            throw new errors.ErrTransactionVersionInvalid(value);
        }

        this.value = value;
    }
}
