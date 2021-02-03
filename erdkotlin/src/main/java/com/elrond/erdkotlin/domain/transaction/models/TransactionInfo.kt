package com.elrond.erdkotlin.domain.transaction.models

import com.elrond.erdkotlin.domain.wallet.models.Address
import java.math.BigInteger

data class TransactionInfo(
    val type: String,
    val nonce: Long,
    val round: Long,
    val epoch: Long,
    val value: BigInteger,
    val sender: Address,
    val receiver: Address,
    val gasPrice: Long,
    val gasLimit: Long,
    val data: String?,
    val signature: String,
    val sourceShard: Long,
    val destinationShard: Long,
    val blockNonce: Long,
    val miniBlockHash: String?,
    val blockHash: String?,
    val status: String,
)
