package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.domain.transaction.models.Transaction

class EstimateCostOfTransactionUsecase internal constructor(private val transactionRepository: TransactionRepository) {

    fun execute(transaction: Transaction) =
        transactionRepository.estimateCostOfTransaction(transaction)
}
