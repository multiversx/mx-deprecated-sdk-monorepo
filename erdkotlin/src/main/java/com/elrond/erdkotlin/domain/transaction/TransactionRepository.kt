package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.Exceptions
import java.io.IOException

internal interface TransactionRepository {

    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    fun sendTransaction(transaction: Transaction): String

}
