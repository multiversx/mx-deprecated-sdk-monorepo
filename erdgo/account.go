package erdgo

import "math/big"

// AccountResponse holds the account endpoint response
type AccountResponse struct {
	Data struct {
		Account *Account `json:"account"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// Account holds an Account's informations
type Account struct {
	Address  string   `json:"address"`
	Nonce    uint64   `json:"nonce"`
	Balance  *big.Int `json:"balance"`
	Code     string   `json:"code"`
	CodeHash []byte   `json:"codeHash"`
	RootHash []byte   `json:"rootHash"`
}
