import { IProvider } from "./interface";
import {GasPrice, GasLimit, TransactionVersion, ChainID, GasPriceModifier} from "./networkParams";

/**
 * An object holding Network configuration parameters.
 */
export class NetworkConfig {
    private static default: NetworkConfig;

    /**
     * The chain ID. E.g. "1" for the Mainnet.
     */
    public ChainID: ChainID;

    /**
     * The gas required by the Network to process a byte of the {@link TransactionPayload}.
     */
    public GasPerDataByte: number;

    /**
     *
     */
    public GasPriceModifier: GasPriceModifier;

    /**
     * The minimum gas limit required to be set when broadcasting a {@link Transaction}.
     */
    public MinGasLimit: GasLimit;

    /**
     * The minimum gas price required to be set when broadcasting a {@link Transaction}.
     */
    public MinGasPrice: GasPrice;

    /**
     * The oldest {@link TransactionVersion} accepted by the Network.
     */
    public MinTransactionVersion: TransactionVersion;

    constructor() {
        this.ChainID = new ChainID("T");
        this.GasPerDataByte = 1500;
        this.MinGasLimit = new GasLimit(50000);
        this.MinGasPrice = new GasPrice(1000000000);
        this.GasPriceModifier = new GasPriceModifier(1);
        this.MinTransactionVersion = new TransactionVersion(1);
    }

    /**
     * Gets the default configuration object (think of the Singleton pattern).
     */
    static getDefault(): NetworkConfig {
        if (!NetworkConfig.default) {
            NetworkConfig.default = new NetworkConfig();
        }

        return NetworkConfig.default;
    }

    /**
     * Synchronizes a configuration object by querying the Network, through a {@link IProvider}.
     * @param provider The provider to use
     */
    async sync(provider: IProvider): Promise<void> {
        let fresh: NetworkConfig = await provider.getNetworkConfig();
        Object.assign(this, fresh);
    }

    /**
     * Constructs a configuration object from a HTTP response (as returned by the provider).
     */
    static fromHttpResponse(payload: any): NetworkConfig {
        let networkConfig = new NetworkConfig();

        networkConfig.ChainID = new ChainID(payload["erd_chain_id"]);
        networkConfig.GasPerDataByte = Number(payload["erd_gas_per_data_byte"]);
        networkConfig.MinGasLimit = new GasLimit(payload["erd_min_gas_limit"]);
        networkConfig.MinGasPrice = new GasPrice(payload["erd_min_gas_price"]);
        networkConfig.MinTransactionVersion = new TransactionVersion(payload["erd_min_transaction_version"]);
        networkConfig.GasPriceModifier = new GasPriceModifier(payload["erd_gas_price_modifier"]);

        return networkConfig;
    }
}
