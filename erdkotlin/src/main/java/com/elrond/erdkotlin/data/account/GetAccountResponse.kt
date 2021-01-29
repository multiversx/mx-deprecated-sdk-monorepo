package com.elrond.erdkotlin.data.account

import com.google.gson.annotations.SerializedName
import java.math.BigInteger

internal data class GetAccountResponse(
    @SerializedName(value = "account")
    val account: AccountData
) {
    internal data class AccountData(
        @SerializedName(value = "nonce")
        val nonce: Long,
        @SerializedName(value = "balance")
        val balance: BigInteger
    )
}
