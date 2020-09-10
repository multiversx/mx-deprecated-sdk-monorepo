package elrond;

import java.io.IOException;

import elrond.Exceptions.ErrProxyRequest;
import elrond.ProxyProvider.PayloadOfGetNetworkConfig;

public class NetworkConfig {
    private static final NetworkConfig defaultInstance = new NetworkConfig();

    private String chainID;
    private int gasPerDataByte;
    private long minGasLimit;
    private long minGasPrice;
    private int minTransactionVersion;

    public NetworkConfig() {
        this.chainID = "T";
        this.gasPerDataByte = 1500;
        this.minGasLimit = 50000;
        this.minGasPrice = 1000000000;
        this.minTransactionVersion = 1;
    }

    public static NetworkConfig getDefault() {
        return defaultInstance;
    }

    /**
     * Synchronizes the object with the current configuration from a provider
     * 
     * @param provider
     * @throws IOException
     * @throws ErrProxyRequest
     */
    public void sync(IProvider provider) throws IOException, ErrProxyRequest {
        NetworkConfig fresh = provider.getNetworkConfig();
        this.assign(fresh);
    }

    private void assign(NetworkConfig other) {
        this.chainID = other.chainID;
        this.gasPerDataByte = other.gasPerDataByte;
        this.minGasLimit = other.minGasLimit;
        this.minGasPrice = other.minGasPrice;
        this.minTransactionVersion = other.minTransactionVersion;
    }

    public static NetworkConfig fromProviderPayload(PayloadOfGetNetworkConfig response) {
        NetworkConfig config = new NetworkConfig();

        config.chainID = response.chainID;
        config.gasPerDataByte = response.gasPerDataByte;
        config.minGasLimit = response.minGasLimit;
        config.minGasPrice = response.minGasPrice;
        config.minTransactionVersion = response.minTransactionVersion;

        return config;
    }

    public String getChainID() {
        return chainID;
    }

    public void setChainID(String chainID) {
        this.chainID = chainID;
    }

    public int getGasPerDataByte() {
        return gasPerDataByte;
    }

    public void setGasPerDataByte(int gasPerDataByte) {
        this.gasPerDataByte = gasPerDataByte;
    }

    public long getMinGasLimit() {
        return minGasLimit;
    }

    public void setMinGasLimit(long minGasLimit) {
        this.minGasLimit = minGasLimit;
    }

    public long getMinGasPrice() {
        return minGasPrice;
    }

    public void setMinGasPrice(long minGasPrice) {
        this.minGasPrice = minGasPrice;
    }

    public int getMinTransactionVersion() {
        return minTransactionVersion;
    }

    public void setMinTransactionVersion(int minTransactionVersion) {
        this.minTransactionVersion = minTransactionVersion;
    }
}