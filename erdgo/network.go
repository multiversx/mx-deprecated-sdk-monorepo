package erdgo

// NetworkConfigResponse holds the network config endpoint response
type NetworkConfigResponse struct {
	Data struct {
		Config *NetworkConfig `json:"config"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// NetworkConfig holds the network configuration parameters
type NetworkConfig struct {
	ChainID                  string `json:"erd_chain_id"`
	Denomination             int    `json:"erd_denomination"`
	GasPerDataByte           uint64 `json:"erd_gas_per_data_byte"`
	LatestTagSoftwareVersion string `json:"erd_latest_tag_software_version"`
	MetaConsensusGroup       uint64 `json:"erd_meta_consensus_group"`
	MinGasLimit              uint64 `json:"erd_min_gas_limit"`
	MinGasPrice              uint64 `json:"erd_min_gas_price"`
	MinTransactionVersion    uint32 `json:"erd_min_transaction_version"`
	NumMetachainNodes        uint64 `json:"erd_num_metachain_nodes"`
	NumNodesInShard          uint64 `json:"erd_num_nodes_in_shard"`
	NumShardsWithoutMeta     uint32 `json:"erd_num_shards_without_meta"`
	RoundDuration            int64  `json:"erd_round_duration"`
	ShardConsensusGroupSize  uint64 `json:"erd_shard_consensus_group_size"`
	StartTime                int64  `json:"erd_start_time"`
}

// NetworkStatusResponse holds the network status response (for a specified shard)
type NetworkStatusResponse struct {
	Data struct {
		Status *NetworkStatus `json:"status"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// NetworkStatus holds the network status details of a specified shard
type NetworkStatus struct {
	CurrentRound               uint64 `json:"erd_current_round"`
	EpochNumber                uint64 `json:"erd_epoch_number"`
	Nonce                      uint64 `json:"erd_nonce"`
	NonceAtEpochStart          uint64 `json:"erd_nonce_at_epoch_start"`
	NoncesPassedInCurrentEpoch uint64 `json:"erd_nonces_passed_in_current_epoch"`
	RoundAtEpochStart          uint64 `json:"erd_round_at_epoch_start"`
	RoundsPassedInCurrentEpoch uint64 `json:"erd_rounds_passed_in_current_epoch"`
	RoundsPerEpoch             uint64 `json:"erd_rounds_per_epoch"`
}
