package com.elrond.erdkotlin

import com.elrond.erdkotlin.TestHelper.alicePrivateKey
import com.elrond.erdkotlin.TestHelper.transactionWithData
import com.elrond.erdkotlin.domain.wallet.models.Wallet
import com.elrond.erdkotlin.domain.transaction.SignTransactionUsecase
import com.elrond.erdkotlin.domain.transaction.models.Transaction
import com.elrond.erdkotlin.domain.wallet.models.Address
import org.junit.Assert
import org.junit.Test

class SignTransactionUsecaseTest {

    private val wallet = Wallet.createFromPrivateKey(alicePrivateKey)

    @Test
    fun `sign with data field`() {
        val transaction = transactionWithData()
        val expectedSignature =
            "096c571889352947f285632d79f2b2ee1b81e7acd19ee20510d34002eba0f999b4720f50211b039dd40914284f84c14eb84815bb045c14dbed036f2e87431307"
        val expectedJson =
            "{'nonce':7,'value':'10000000000000000000','receiver':'erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r','sender':'erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz','gasPrice':1000000000,'gasLimit':70000,'data':'Zm9yIHRoZSBib29rIHdpdGggc3Rha2U=','chainID':'1','version':1,'signature':'$expectedSignature'}".replace(
                '\'',
                '"'
            )

        val signedTransaction = SignTransactionUsecase().execute(transaction, wallet)

        Assert.assertEquals(expectedSignature, signedTransaction.signature)
        Assert.assertEquals(expectedJson, signedTransaction.serialize())
    }

    @Test
    fun `sign with username`() {
        val transaction = Transaction(
            sender = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
            receiver = Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
            value = 0.toBigInteger(),
            senderUsername = "alice",
            receiverUsername = "bob",
            data = "",
            chainID = "local-testnet",
            gasPrice = 1000000000,
            gasLimit = 50000,
            nonce = 89
        )
        val expectedSerialized =
            """{"nonce":89,"value":"0","receiver":"erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx","sender":"erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th","senderUsername":"YWxpY2U=","receiverUsername":"Ym9i","gasPrice":1000000000,"gasLimit":50000,"chainID":"local-testnet","version":1}"""

        val expectedSignature =
            "264febfbb40e5a60143a035f054e12507738336a6b387ca4731c433b70bae785d631899bd86d6d8f68b293e579c0cf4b63a4eddfb9d91e46edb5d9eb1164160f"
        val expectedJson =
            "{'nonce':89,'value':'0','receiver':'erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx','sender':'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th','senderUsername':'YWxpY2U=','receiverUsername':'Ym9i','gasPrice':1000000000,'gasLimit':50000,'chainID':'local-testnet','version':1,'signature':'$expectedSignature'}".replace(
                '\'',
                '"'
            )

        val signedTransaction = SignTransactionUsecase().execute(transaction, wallet)

        Assert.assertEquals(expectedSerialized, transaction.serialize())
        Assert.assertEquals(expectedSignature, signedTransaction.signature)
        Assert.assertEquals(expectedJson, signedTransaction.serialize())
    }


    @Test
    fun `sign without data field`() {
        // Without data field
        val transaction = TestHelper.transactionWithoutData()
        val expectedSignature =
            "4a6d8186eae110894e7417af82c9bf9592696c0600faf110972e0e5310d8485efc656b867a2336acec2b4c1e5f76c9cc70ba1803c6a46455ed7f1e2989a90105"
        val expectedJson =
            "{'nonce':8,'value':'10000000000000000000','receiver':'erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r','sender':'erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz','gasPrice':1000000000,'gasLimit':50000,'chainID':'1','version':1,'signature':'$expectedSignature'}".replace(
                '\'',
                '"'
            )
        val signedTransaction = SignTransactionUsecase().execute(transaction, wallet)

        Assert.assertEquals(expectedSignature, signedTransaction.signature)
        Assert.assertEquals(expectedJson, signedTransaction.serialize())
    }

    @Test
    fun `sign with option`() {
        // with an option
        val transaction = TestHelper.transactionWithoutData().copy(
            option = Transaction.OPTION_TX_HASH_SIGN
        )
        val expectedSignature =
            "c48181af13b1c51426e7e985a790f62c98cf9e0297e8d0c0b044fe3a12391381fee833e71a33ca27287ffb5191aa46235747b1164ed574297e39ae74dd26b606"
        val expectedJson =
            "{'nonce':8,'value':'10000000000000000000','receiver':'erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r','sender':'erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz','gasPrice':1000000000,'gasLimit':50000,'chainID':'1','version':1,'option':1,'signature':'$expectedSignature'}".replace(
                '\'',
                '"'
            )
        val signedTransaction = SignTransactionUsecase().execute(transaction, wallet)

        Assert.assertEquals(expectedSignature, signedTransaction.signature)
        Assert.assertEquals(expectedJson, signedTransaction.serialize())
    }

}