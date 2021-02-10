package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.transaction.models.Transaction
import com.elrond.erdkotlin.domain.wallet.models.Wallet
import java.io.IOException

class SendTransactionUsecase internal constructor(
    private val signTransactionUsecase: SignTransactionUsecase,
    private val transactionRepository: TransactionRepository
) {
    @Throws(
        Exceptions.CannotSignTransactionException::class, IOException::class,
        Exceptions.ProxyRequestException::class,
        Exceptions.CannotSerializeTransactionException::class
    )
    fun execute(transaction: Transaction, wallet: Wallet): Transaction {
        val signedTransaction = when {
            transaction.isSigned -> transaction
            else -> signTransactionUsecase.execute(transaction, wallet)
        }
        return transactionRepository.sendTransaction(signedTransaction).let { sentTransaction ->
            signedTransaction.copy(txHash = sentTransaction.hash)
        }
    }

}
