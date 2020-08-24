import { Provider } from "./interface";
import { GasPrice, GasLimit, TransactionVersion, ChainID } from "./networkParams";


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
