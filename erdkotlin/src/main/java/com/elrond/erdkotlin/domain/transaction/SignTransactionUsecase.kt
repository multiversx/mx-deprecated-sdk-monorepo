package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.transaction.models.Transaction
import com.elrond.erdkotlin.domain.wallet.models.Wallet

internal class SignTransactionUsecase {

    @Throws(Exceptions.CannotSignTransactionException::class)
    fun execute(transaction: Transaction, wallet: Wallet) = try {
        transaction.copy(signature = wallet.sign(transaction.serialize()))
    } catch (error: Exceptions.CannotSerializeTransactionException) {
        throw Exceptions.CannotSignTransactionException()
    }
}
