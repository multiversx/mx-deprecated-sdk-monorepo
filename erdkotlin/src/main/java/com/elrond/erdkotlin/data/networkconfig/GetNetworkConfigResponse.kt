package com.elrond.erdkotlin.data.networkconfig

import com.google.gson.annotations.SerializedName

internal data class GetNetworkConfigResponse(
    @SerializedName(value = "config")
    val config: NetworkConfigData
) {
    internal data class NetworkConfigData(
        @SerializedName(value = "erd_chain_id")
        val chainID: String,
        @SerializedName(value = "erd_gas_per_data_byte")
        val gasPerDataByte: Int,
        @SerializedName(value = "erd_min_gas_limit")
        val minGasLimit: Long,
        @SerializedName(value = "erd_min_gas_price")
        val minGasPrice: Long,
        @SerializedName(value = "erd_min_transaction_version")
        val minTransactionVersion: Int
    )
}