package com.elrond.erdkotlin.data.transaction.responses

internal data class GetTransactionStatusResponse(
    val status: String // ex: "pending", "success"
)
