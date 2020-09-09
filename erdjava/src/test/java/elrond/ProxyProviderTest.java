package elrond;

import static org.junit.Assert.assertEquals;

import org.junit.Ignore;
import org.junit.Test;

public class ProxyProviderTest {
    @Ignore("performs HTTP request")
    @Test
    public void getNetworkConfig() throws Exception {
        String url = "https://testnet-api.elrond.com";
        ProxyProvider provider = new ProxyProvider(url);
        NetworkConfig config = provider.getNetworkConfig();

        assertEquals("T", config.getChainID());
        assertEquals(50000, config.getMinGasLimit());
    }
}
