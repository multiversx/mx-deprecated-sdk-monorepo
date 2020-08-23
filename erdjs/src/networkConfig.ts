import { Provider } from "./interface";
import { GasPrice, GasLimit } from "./gas";

export class NetworkConfig {
    static Default: NetworkConfig = new NetworkConfig();

    public ChainID: string = "1";
    public GasPerDataByte: number = 1500;
    public MinGasLimit: GasLimit = new GasLimit(50000);
    public MinGasPrice: GasPrice = new GasPrice(1000000000);
    public MinTransactionVersion: number = 1;

    async sync(provider: Provider): Promise<void> {
        let fresh: NetworkConfig = await provider.getNetworkConfig();
        Object.assign(this, fresh);
    }
}

// chain ID,
// tx version.