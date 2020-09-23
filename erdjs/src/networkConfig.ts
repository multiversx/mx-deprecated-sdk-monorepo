import { Provider } from "./interface";
import { GasPrice, GasLimit, TransactionVersion, ChainID } from "./networkParams";


export class NetworkConfig {
    private static default: NetworkConfig;

    public ChainID: ChainID;
    public GasPerDataByte: number;
    public MinGasLimit: GasLimit;
    public MinGasPrice: GasPrice;
    public MinTransactionVersion: TransactionVersion;

    constructor() {
        this.ChainID = new ChainID("T");
        this.GasPerDataByte = 1500;
        this.MinGasLimit = new GasLimit(50000);
        this.MinGasPrice = new GasPrice(1000000000);
        this.MinTransactionVersion = new TransactionVersion(1);
    }

    static getDefault(): NetworkConfig {
        if (!NetworkConfig.default) {
            NetworkConfig.default = new NetworkConfig();
        }

        return NetworkConfig.default;
    }

    async sync(provider: Provider): Promise<void> {
        let fresh: NetworkConfig = await provider.getNetworkConfig();
        Object.assign(this, fresh);
    }

    static fromHttpResponse(payload: any): NetworkConfig {
        let networkConfig = new NetworkConfig();

        networkConfig.ChainID = new ChainID(payload["erd_chain_id"]);
        networkConfig.GasPerDataByte = Number(payload["erd_gas_per_data_byte"]);
        networkConfig.MinGasLimit = new GasLimit(payload["erd_min_gas_limit"]);
        networkConfig.MinGasPrice = new GasPrice(payload["erd_min_gas_price"]);
        networkConfig.MinTransactionVersion = new TransactionVersion(payload["erd_min_transaction_version"]);

        return networkConfig;
    }
}
