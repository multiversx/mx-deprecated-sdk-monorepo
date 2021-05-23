package com.elrond.erdkotlin.domain.networkconfig.models

data class NetworkConfig(
    val chainID: String,
    val erdDenomination: Int,
    val gasPerDataByte: Int,
    val erdGasPriceModifier: Double,
    val erdLatestTagSoftwareVersion: String,
    val erdMetaConsensusGroupSize: Long,
    val minGasLimit: Long,
    val minGasPrice: Long,
    val minTransactionVersion: Int,
    val erdNumMetachainNodes: Long,
    val erdNumNodesInShard: Long,
    val erdNumShardsWithoutMeta: Int,
    val erdRewardsTopUpGradientPoint: String,
    val erdRoundDuration: Long,
    val erdRoundsPerEpoch: Long,
    val erdShardConsensusGroupSize: Long,
    val erdStartTime: Long,
    val erdTopUpFactor: String
) {
    // keep it to allow companion extension
    companion object
}
