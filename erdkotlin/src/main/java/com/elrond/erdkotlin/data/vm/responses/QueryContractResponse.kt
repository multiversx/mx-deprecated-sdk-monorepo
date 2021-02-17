package com.elrond.erdkotlin.data.vm.responses

import com.elrond.erdkotlin.domain.vm.SmartContractOutput
import com.google.gson.internal.LinkedTreeMap
import java.math.BigInteger

internal data class QueryContractResponse(
    val data: Data
) {

    data class Data(
        val returnData: List<String>?, // ex: ["Aw=="]
        val returnCode: String, // ex: "ok"
        val returnMessage: String?,
        val gasRemaining: BigInteger,
        val gasRefund: BigInteger,
        val outputAccounts: LinkedTreeMap<String, SmartContractOutput.OutputAccount>,

        // Keeping those as placeholders for future development
        // https://github.com/ElrondNetwork/elrond-go/blob/master/core/vmcommon/output.go
        private val deletedAccounts: Any?,
        private val touchedAccounts: Any?,
        private val logs: Any?
    )
}
