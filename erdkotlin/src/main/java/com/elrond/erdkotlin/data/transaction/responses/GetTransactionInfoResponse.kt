package com.elrond.erdkotlin.data.transaction.responses

import java.math.BigInteger

internal class GetTransactionInfoResponse(
    val transaction: TransactionInfoData
) {
    data class TransactionInfoData(
        val type: String,
        val nonce: Long,
        val round: Long,
        val epoch: Long,
        val value: BigInteger,
        val sender: String,
        val receiver: String,
        val senderUsername: String?,
        val receiverUsername: String?,
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
        val hyperblockNonce: Long?
    )

}
