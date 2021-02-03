package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.domain.wallet.models.Address

class GetTransactionStatusUsecase internal constructor(private val transactionRepository: TransactionRepository) {

    fun execute(txHash: String, sender: Address? = null) =
        transactionRepository.getTransactionStatus(txHash, sender)
}
