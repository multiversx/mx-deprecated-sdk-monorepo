package com.elrond.erdkotlin.domain.account

import com.elrond.erdkotlin.domain.wallet.Address
import java.math.BigInteger

data class Account(
    val address: Address,
    val nonce: Long = 0,
    val balance: BigInteger = 0.toBigInteger(),
) {
    // keep it to allow companion extension
    companion object
}
