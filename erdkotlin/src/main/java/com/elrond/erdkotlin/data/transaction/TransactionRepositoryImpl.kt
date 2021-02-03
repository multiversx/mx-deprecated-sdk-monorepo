package com.elrond.erdkotlin.data.transaction

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.data.api.ElrondProxy
import com.elrond.erdkotlin.data.toDomain
import com.elrond.erdkotlin.domain.transaction.TransactionRepository
import com.elrond.erdkotlin.domain.transaction.models.*
import com.elrond.erdkotlin.domain.transaction.models.TransactionHash
import com.elrond.erdkotlin.domain.wallet.models.Address
import java.io.IOException

internal class TransactionRepositoryImpl(
    private val elrondProxy: ElrondProxy
) : TransactionRepository {
    @Throws(
        IOException::class,
        Exceptions.CannotSerializeTransactionException::class,
        Exceptions.ProxyRequestException::class
    )
    override fun sendTransaction(transaction: Transaction): TransactionHash {
        val response = elrondProxy.sendTransaction(transaction)
        return TransactionHash(requireNotNull(response.data).txHash)
    }

    override fun getTransactions(address: Address): List<TransactionOnNetwork> {
        val response = elrondProxy.getAddressTransactions(address)
        return requireNotNull(response.data).transactions.map { it.toDomain() }
    }

    override fun estimateCostOfTransaction(transaction: TransactionToEstimate): String {
        val response = elrondProxy.estimateCostOfTransaction(transaction)
        return requireNotNull(response.data).txGasUnits
    }

    override fun getTransactionInfo(txHash: String, sender: Address?): TransactionInfo {
        val response = elrondProxy.getTransactionInfo(txHash, sender)
        return requireNotNull(response.data).transaction.toDomain()
    }

    override fun getTransactionStatus(txHash: String, sender: Address?): String {
        val response = elrondProxy.getTransactionStatus(txHash, sender)
        return requireNotNull(response.data).status
    }
}
