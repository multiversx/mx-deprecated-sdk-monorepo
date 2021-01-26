package com.elrond.erdkotlin.data.transaction

import com.google.gson.annotations.SerializedName

internal class TransactionResponse(
    @SerializedName(value = "txHash")
    val txHash: String
)