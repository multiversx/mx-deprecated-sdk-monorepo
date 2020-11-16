package elrond;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.math.BigInteger;

import org.junit.Ignore;
import org.junit.Test;

@Ignore("performs HTTP requests")
public class ProxyProviderTest {
    private final ProxyProvider provider;

    public ProxyProviderTest() {
        this.provider = new ProxyProvider("https://testnet-api.elrond.com");
    }

    @Test
    public void getNetworkConfig() throws Exception {
        NetworkConfig config = this.provider.getNetworkConfig();

        assertEquals("T", config.getChainID());
        assertEquals(50000, config.getMinGasLimit());
    }

    @Test
    public void getAccount() throws Exception {
        Address address = Address.fromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        AccountOnNetwork account = this.provider.getAccount(address);

        assertTrue(account.getNonce() > 0);
        assertTrue(account.getBalance().compareTo(BigInteger.ZERO) > 0);
    }
}
