package com.elrond.erdkotlin.domain.transaction

import com.elrond.erdkotlin.domain.wallet.models.Address

class GetAddressTransactionsUsecase internal constructor(private val transactionRepository: TransactionRepository) {

    fun execute(address: Address) = transactionRepository.getTransactions(address)
}
