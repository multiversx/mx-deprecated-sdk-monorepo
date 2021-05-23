package com.elrond.erdkotlin.data.account.responses

import java.math.BigInteger

internal data class GetAccountResponse(
    val account: AccountData
) {
    internal data class AccountData(
        val nonce: Long,
        val balance: BigInteger,
        val code: String?,
        val username: String?
    )
}
