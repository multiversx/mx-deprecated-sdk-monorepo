package com.elrond.erdkotlin

import com.elrond.erdkotlin.domain.wallet.models.Address
import com.elrond.erdkotlin.domain.transaction.models.Transaction

object TestHelper {
    const val alicePrivateKey = "1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf"

    private val transactionWithData = Transaction(
        nonce = 7,
        value = "10000000000000000000".toBigInteger(),
        sender = Address.fromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"),
        receiver = Address.fromBech32("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"),
        gasPrice = 1000000000,
        gasLimit = 70000,
        data = "for the book with stake",
        chainID = "1"
    )

    private val transactionWithoutData = Transaction(
        nonce = 8,
        value = "10000000000000000000".toBigInteger(),
        sender = Address.fromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"),
        receiver = Address.fromBech32("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"),
        gasPrice = 1000000000,
        gasLimit = 50000,
        chainID = "1"
    )

    fun transactionWithData() = transactionWithData.copy()
    fun transactionWithoutData() = transactionWithoutData.copy()

}
