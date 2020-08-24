import { Provider } from "./interface";
import { GasPrice, GasLimit } from "./gas";
import { errors } from ".";

export class NetworkConfig {
    static Default: NetworkConfig = new NetworkConfig();

    public ChainID: ChainID = new ChainID("T");
    public GasPerDataByte: number = 1500;
    public MinGasLimit: GasLimit = new GasLimit(50000);
    public MinGasPrice: GasPrice = new GasPrice(1000000000);
    public MinTransactionVersion: TransactionVersion = new TransactionVersion(1);

    async sync(provider: Provider): Promise<void> {
        let fresh: NetworkConfig = await provider.getNetworkConfig();
        Object.assign(this, fresh);
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
        if (value < 1) {
            throw new errors.ErrTransactionVersionInvalid(value);
        }

        this.value = value;
    }
}