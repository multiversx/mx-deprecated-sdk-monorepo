package com.elrond.erdkotlin

import org.junit.Test

import org.junit.Assert.assertEquals


class TransactionTest {

    @Test
    @Throws(java.lang.Exception::class)
    fun shouldSerialize() {
        // Without data field
        var transaction = TestHelper.transactionWithoutData()
        var expected =
            "{'nonce':8,'value':'10000000000000000000','receiver':'erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r','sender':'erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz','gasPrice':1000000000,'gasLimit':50000,'chainID':'1','version':1}".replace(
                '\'',
                '"'
            )
        assertEquals(expected, transaction.serialize())

        // With data field
        transaction = transaction.copy(data = "foobar")
        expected =
            "{'nonce':8,'value':'10000000000000000000','receiver':'erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r','sender':'erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz','gasPrice':1000000000,'gasLimit':50000,'data':'Zm9vYmFy','chainID':'1','version':1}".replace(
                '\'',
                '"'
            )
        assertEquals(expected, transaction.serialize())
    }

}