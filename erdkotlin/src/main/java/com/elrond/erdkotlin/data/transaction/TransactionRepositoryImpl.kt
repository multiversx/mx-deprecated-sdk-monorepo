package com.elrond.erdkotlin.data.transaction

import com.elrond.erdkotlin.data.ElrondClient
import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.transaction.Transaction
import com.elrond.erdkotlin.domain.transaction.TransactionRepository
import java.io.IOException

internal class TransactionRepositoryImpl internal constructor(
    private val elrondClient: ElrondClient
) : TransactionRepository {
    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    override fun sendTransaction(transaction: Transaction): String {
        val requestJson = transaction.serialize()
        val response: ElrondClient.ResponseBase<TransactionResponse> = elrondClient.doPost(
            "transaction/send", requestJson
        )
        return requireNotNull(response.data).txHash
    }
}