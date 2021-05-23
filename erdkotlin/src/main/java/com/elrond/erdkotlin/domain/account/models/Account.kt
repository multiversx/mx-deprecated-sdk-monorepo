package com.elrond.erdkotlin.domain.account.models

import com.elrond.erdkotlin.domain.wallet.models.Address
import java.math.BigInteger

data class Account(
    val address: Address,
    val nonce: Long = 0,
    val balance: BigInteger = 0.toBigInteger(),
    val code: String? = null,
    val username: String? = null
) {
    // keep it to allow companion extension
    companion object
}
