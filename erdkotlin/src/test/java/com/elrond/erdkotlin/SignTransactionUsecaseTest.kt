package com.elrond.erdkotlin

import com.elrond.erdkotlin.TestHelper.alicePrivateKey
import com.elrond.erdkotlin.TestHelper.transactionWithData
import com.elrond.erdkotlin.domain.wallet.Wallet
import com.elrond.erdkotlin.domain.transaction.SignTransactionUsecase
import org.junit.Assert
import org.junit.Test

class SignTransactionUsecaseTest {

    private val wallet = Wallet.createFromPrivateKey(alicePrivateKey)

    @Test
    @Throws(Exception::class)
    fun signWithDataField() {
        // With data field
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
    fun signWithoutDataField() {
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

}
