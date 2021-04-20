package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.transaction.models.*
import com.elrond.erdkotlin.domain.transaction.models.TransactionHash
import com.elrond.erdkotlin.domain.wallet.models.Address
import java.io.IOException

internal interface TransactionRepository {

    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    fun sendTransaction(transaction: Transaction): TransactionHash

    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    fun getTransactions(address: Address): List<TransactionOnNetwork>

    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    fun estimateCostOfTransaction(transaction: Transaction): String

    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    fun getTransactionInfo(txHash: String, sender: Address?): TransactionInfo

    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    fun getTransactionStatus(txHash: String, sender: Address?): String
}
