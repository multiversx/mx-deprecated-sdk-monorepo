package erdgo

// Hyperblock holds a hyperblock's details
type Hyperblock struct {
	Nonce         uint64 `json:"nonce"`
	Round         uint64 `json:"round"`
	Hash          string `json:"hash"`
	PrevBlockHash string `json:"prevBlockHash"`
	Epoch         uint64 `json:"epoch"`
	NumTxs        uint64 `json:"numTxs"`
	ShardBlocks   []struct {
		Hash  string `json:"hash"`
		Nonce uint64 `json:"nonce"`
		Shard uint32 `json:"shard"`
	} `json:"shardBlocks"`
	Transactions []TransactionOnNetwork
}

// HyperblockResponse holds a hyperblock info response from the network
type HyperblockResponse struct {
	Data struct {
		Hyperblock Hyperblock `json:"hyperblock"`
	}
	Error string `json:"error"`
	Code  string `json:"code"`
}
