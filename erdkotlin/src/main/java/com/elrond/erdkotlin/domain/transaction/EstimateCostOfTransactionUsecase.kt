package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.domain.transaction.models.TransactionToEstimate

class EstimateCostOfTransactionUsecase internal constructor(private val transactionRepository: TransactionRepository) {

    fun execute(transaction: TransactionToEstimate) =
        transactionRepository.estimateCostOfTransaction(transaction)
}
