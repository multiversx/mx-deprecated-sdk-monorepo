package erdgo

// SendTransactionResponse holds the response received from the network when broadcasting a transaction
type SendTransactionResponse struct {
	Data struct {
		TxHash string `json:"txHash"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// Transaction holds the fields of a transaction to be broadcasted to the network
type Transaction struct {
	Nonce     uint64 `json:"nonce"`
	Value     string `json:"value"`
	RcvAddr   string `json:"receiver"`
	SndAddr   string `json:"sender"`
	GasPrice  uint64 `json:"gasPrice,omitempty"`
	GasLimit  uint64 `json:"gasLimit,omitempty"`
	Data      []byte `json:"data,omitempty"`
	Signature string `json:"signature,omitempty"`
	ChainID   string `json:"chainID"`
	Version   uint32 `json:"version"`
}

// TransactionStatus holds a transaction's status response from the network
type TransactionStatus struct {
	Data struct {
		Status string `json:"status"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// TransactionInfo holds a transaction info response from the network
type TransactionInfo struct {
	Data struct {
		Transaction TransactionOnNetwork `json:"transaction"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// TransactionOnNetwork holds a transaction's info entry in a hyperblock
type TransactionOnNetwork struct {
	Type             string `json:"type"`
	Hash             string `json:"hash"`
	Nonce            uint64 `json:"nonce"`
	Value            string `json:"value"`
	Receiver         string `json:"receiver"`
	Sender           string `json:"sender"`
	GasPrice         uint64 `json:"gasPrice"`
	GasLimit         uint64 `json:"gasLimit"`
	Data             []byte `json:"data"`
	Signature        string `json:"signature"`
	SourceShard      uint32 `json:"sourceShard"`
	DestinationShard uint32 `json:"destinationShard"`
	MiniblockType    string `json:"miniblockType"`
	MiniblockHash    string `json:"miniblockHash"`
	Status           string `json:"status"`
	HyperblockNonce  uint64 `json:"hyperblockNonce"`
	HyperblockHash   string `json:"hyperblockHash"`
}
