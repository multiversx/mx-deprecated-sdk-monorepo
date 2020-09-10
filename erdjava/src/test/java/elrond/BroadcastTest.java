package elrond;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.math.BigInteger;

import org.junit.Ignore;
import org.junit.Test;

@Ignore("performs HTTP requests")
public class BroadcastTest {
    private final ProxyProvider provider;

    public BroadcastTest() {
        this.provider = new ProxyProvider("https://testnet-api.elrond.com");
    }

    @Test
    public void sendTransactions() throws Exception {
        NetworkConfig.getDefault().sync(this.provider);

        Address addressOfAlice = Address.fromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        Account alice = new Account(addressOfAlice);
        alice.sync(this.provider);
        assertTrue(alice.getBalance().compareTo(BigInteger.ZERO) > 0);

        String privateKeyOfAlice = "1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf";
        Wallet walletOfAlice = new Wallet(privateKeyOfAlice);

        for (int i = 0; i < 5; i++) {
            Transaction transaction = new Transaction();
            assertEquals("T", transaction.getChainID());
            assertEquals(1000000000, transaction.getGasPrice());

            Address addressOfBob = Address.fromBech32("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r");

            transaction.setNonce(alice.getNonce());
            transaction.setSender(addressOfAlice);
            transaction.setReceiver(addressOfBob);
            transaction.sign(walletOfAlice);
            transaction.send(this.provider);

            assertEquals(64, transaction.getTxHash().length());
            alice.incrementNonce();
        }
    }
}