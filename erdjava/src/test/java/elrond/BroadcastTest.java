package elrond;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.math.BigInteger;

import org.junit.Test;

//@Ignore("performs HTTP requests")
public class BroadcastTest {
    private final ProxyProvider provider;

    public BroadcastTest() {
        this.provider = new ProxyProvider("https://testnet-api.elrond.com");
    }

    @Test
    public void sendTransaction() throws Exception {
        NetworkConfig.getDefault().sync(this.provider);

        Transaction transaction = new Transaction();
        assertEquals("T", transaction.getChainID());
        assertEquals(1000000000, transaction.getGasPrice());

        Address senderAddress = Address.fromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        Account sender = new Account(senderAddress);
        sender.sync(this.provider);
        assertTrue(sender.getBalance().compareTo(BigInteger.ZERO) > 0);
    }
}