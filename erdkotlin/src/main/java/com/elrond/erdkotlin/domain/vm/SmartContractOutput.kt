package com.elrond.erdkotlin.domain.vm

import com.google.gson.internal.LinkedTreeMap
import java.math.BigInteger

data class SmartContractOutput(
    val returnData: List<String>?,
    val returnCode: String,
    val returnMessage: String?,
    val gasRemaining: BigInteger,
    val gasRefund: BigInteger,
    val outputAccounts: LinkedTreeMap<String, OutputAccount>
) {
    data class OutputAccount(
        val address: String,
        val nonce: Long,
        val balance: BigInteger?,
        val balanceDelta: BigInteger,
        val storageUpdates: LinkedTreeMap<String, StorageUpdate>?,
        val callType: Long,

        // documentation is not clear about this
        // Keeping those as placeholders for future development
        val code: Any?,
        val codeMetadata: Any?,
        val data: Any?,
        val gasLimit: Any?,
    ){
        data class StorageUpdate(
            val offset: String
        )
    }
}
