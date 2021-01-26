package com.elrond.erdkotlin

import com.elrond.erdkotlin.domain.wallet.Wallet
import org.junit.Assert
import org.junit.Ignore
import org.junit.Test

@Ignore
class SendTransactionUsecaseTest {

    private val wallet = Wallet.createFromPrivateKey(TestHelper.alicePrivateKey)
    private val sendTransactionUsecase = ErdSdk.sendTransactionUsecase()

    @Test
    fun `sent transaction should have tx`(){
        val transaction = TestHelper.transactionWithoutData()
        val sentTransaction = sendTransactionUsecase.execute(transaction, wallet)
        Assert.assertNotEquals("", sentTransaction.txHash)
    }

}