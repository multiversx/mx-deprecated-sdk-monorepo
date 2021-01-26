package com.elrond.erdkotlin

import org.junit.Ignore

@Ignore("performs HTTP requests")
class BroadcastTest {
//    private val provider = ProxyProvider("https://testnet-api.elrond.com")

//    @Test
//    @Throws(Exception::class)
//    fun sendTransactions() {
//        NetworkConfig.default.sync(provider)
//        val addressOfAlice =
//            Address.fromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz")
//        val alice = Account(addressOfAlice)
//        alice.sync(provider)
//        assertTrue(alice.balance > BigInteger.ZERO)
//        val privateKeyOfAlice = "1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf"
//        val walletOfAlice = Wallet.createFromPrivateKey(privateKeyOfAlice)
//        val addressOfBob = Address.fromBech32(
//            "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"
//        )
//        for (i in 0..4) {
//            val transaction = Transaction(
//                sender = addressOfAlice,
//                receiver = addressOfBob,
//                nonce = alice.nonce
//            )
//            assertEquals("T", transaction.chainID)
//            assertEquals(1000000000, transaction.gasPrice)
//            transaction.sign(walletOfAlice)
//            transaction.send(provider)
//            assertEquals(64, transaction.txHash.length)
//            alice.incrementNonce()
//        }
//    }
}