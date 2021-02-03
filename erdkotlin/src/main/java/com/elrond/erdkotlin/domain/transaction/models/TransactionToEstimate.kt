package com.elrond.erdkotlin.domain.transaction.models

import com.elrond.erdkotlin.domain.wallet.models.Address
import java.math.BigInteger

data class TransactionToEstimate(
    val version: Int = 1,
    val chainID: String,
    val value: BigInteger = 0.toBigInteger(),
    val sender: Address,
    val receiver: Address,
    val data: String?
)
