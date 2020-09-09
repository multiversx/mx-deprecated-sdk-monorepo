package elrond;

import org.junit.Test;
import java.math.BigInteger;

import static org.junit.Assert.assertEquals;

public class TransactionTest {
    @Test
    public void shouldSerialize() {
        Transaction transaction = new Transaction();

        // Without data (memo) field
        transaction.setNonce(0);
        transaction.setValue(new BigInteger("42"));
        transaction.setSender("erd1alice");
        transaction.setReceiver("erd1bob");
        transaction.setGasPrice(1000000000);
        transaction.setGasLimit(50000);
        transaction.setChainID("1");

        String expected = "{\"nonce\":0,\"value\":\"42\",\"receiver\":\"erd1bob\",\"sender\":\"erd1alice\",\"gasPrice\":1000000000,\"gasLimit\":50000,\"chainID\":\"1\",\"version\":1}";
        assertEquals(expected, transaction.serialize());

        // With data (memo) field
        transaction.setData("foobar");
        expected = "{\"nonce\":0,\"value\":\"42\",\"receiver\":\"erd1bob\",\"sender\":\"erd1alice\",\"gasPrice\":1000000000,\"gasLimit\":50000,\"data\":\"Zm9vYmFy\",\"chainID\":\"1\",\"version\":1}";
        assertEquals(expected, transaction.serialize());
    }

    @Test
    public void shouldSign() {
        String alicePrivateKey = "1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf";
        Signer aliceSigner = new Signer(alicePrivateKey);

        // With data (memo) field
        Transaction transaction = new Transaction();
        transaction.setNonce(7);
        transaction.setValue(new BigInteger("10000000000000000000"));
        transaction.setSender("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        transaction.setReceiver("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r");
        transaction.setGasPrice(1000000000);
        transaction.setGasLimit(70000);
        transaction.setData("for the book");
        transaction.setChainID("1");
        transaction.sign(aliceSigner);

        String expectedSignature = "1702bb7696f992525fb77597956dd74059b5b01e88c813066ad1f6053c6afca97d6eaf7039b2a21cccc7d73b3e5959be4f4c16f862438c7d61a30c91e3d16c01";
        String expectedJson = "{\"nonce\":7,\"value\":\"10000000000000000000\",\"receiver\":\"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r\",\"sender\":\"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz\",\"gasPrice\":1000000000,\"gasLimit\":70000,\"data\":\"Zm9yIHRoZSBib29r\",\"chainID\":\"1\",\"version\":1,\"signature\":\"1702bb7696f992525fb77597956dd74059b5b01e88c813066ad1f6053c6afca97d6eaf7039b2a21cccc7d73b3e5959be4f4c16f862438c7d61a30c91e3d16c01\"}";
        assertEquals(expectedSignature, transaction.getSignature());
        assertEquals(expectedJson, transaction.serialize());

        // Without data (memo) field
        transaction = new Transaction();
        transaction.setNonce(8);
        transaction.setValue(new BigInteger("10000000000000000000"));
        transaction.setSender("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        transaction.setReceiver("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r");
        transaction.setGasPrice(1000000000);
        transaction.setGasLimit(50000);
        transaction.setData("");
        transaction.setChainID("1");
        transaction.sign(aliceSigner);

        expectedSignature = "4a6d8186eae110894e7417af82c9bf9592696c0600faf110972e0e5310d8485efc656b867a2336acec2b4c1e5f76c9cc70ba1803c6a46455ed7f1e2989a90105";
        expectedJson = "{\"nonce\":8,\"value\":\"10000000000000000000\",\"receiver\":\"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r\",\"sender\":\"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz\",\"gasPrice\":1000000000,\"gasLimit\":50000,\"chainID\":\"1\",\"version\":1,\"signature\":\"4a6d8186eae110894e7417af82c9bf9592696c0600faf110972e0e5310d8485efc656b867a2336acec2b4c1e5f76c9cc70ba1803c6a46455ed7f1e2989a90105\"}";
        assertEquals(expectedSignature, transaction.getSignature());
        assertEquals(expectedJson, transaction.serialize());
    }
}
