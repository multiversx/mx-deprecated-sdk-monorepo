package com.elrond.erdkotlin.data.networkconfig

import com.google.gson.annotations.SerializedName

internal data class GetNetworkConfigResponse(
    val config: NetworkConfigData
) {
    internal data class NetworkConfigData(
        @SerializedName(value = "erd_chain_id")
        val chainID: String,
        @SerializedName(value = "erd_denomination")
        val erdDenomination: Int,
        @SerializedName(value = "erd_gas_per_data_byte")
        val gasPerDataByte: Int,
        @SerializedName(value = "erd_gas_price_modifier")
        val erdGasPriceModifier: Double,
        @SerializedName(value = "erd_latest_tag_software_version")
        val erdLatestTagSoftwareVersion: String,
        @SerializedName(value = "erd_meta_consensus_group_size")
        val erdMetaConsensusGroupSize: Long,
        @SerializedName(value = "erd_min_gas_limit")
        val minGasLimit: Long,
        @SerializedName(value = "erd_min_gas_price")
        val minGasPrice: Long,
        @SerializedName(value = "erd_min_transaction_version")
        val minTransactionVersion: Int,
        @SerializedName(value = "erd_num_metachain_nodes")
        val erdNumMetachainNodes: Long,
        @SerializedName(value = "erd_num_nodes_in_shard")
        val erdNumNodesInShard: Long,
        @SerializedName(value = "erd_num_shards_without_meta")
        val erdNumShardsWithoutMeta: Int,
        @SerializedName(value = "erd_rewards_top_up_gradient_point")
        val erdRewardsTopUpGradientPoint: String,
        @SerializedName(value = "erd_round_duration")
        val erdRoundDuration: Long,
        @SerializedName(value = "erd_rounds_per_epoch")
        val erdRoundsPerEpoch: Long,
        @SerializedName(value = "erd_shard_consensus_group_size")
        val erdShardConsensusGroupSize: Long,
        @SerializedName(value = "erd_start_time")
        val erdStartTime: Long,
        @SerializedName(value = "erd_top_up_factor")
        val erdTopUpFactor: String
    )
}

