package com.elrond.erdkotlin.domain.networkconfig

data class NetworkConfig(
    var chainID: String,
    var gasPerDataByte: Int,
    var minGasLimit: Long,
    var minGasPrice: Long,
    var minTransactionVersion: Int
) {
    // keep it to allow companion extension
    companion object
}
