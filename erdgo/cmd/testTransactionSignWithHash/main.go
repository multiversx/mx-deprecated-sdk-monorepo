package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

const (
	versionForTxHashSigning = 2
	optionsForTxHashSigning = 1
)

func main() {
	ep := erdgo.NewElrondProxy("http://localhost:8079")

	// Load a wallet .PEM file
	privateKey, err := erdgo.LoadPrivateKeyFromPemFile("../../tests/alice.pem")
	if err != nil {
		fmt.Printf("Unable to load alice.pem: %s\n\r", err)
		return
	}
	// Generate address from private key
	address, err := erdgo.GetAddressFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error generating address: %s\n\r", err)
		return
	}
	// Get account info
	account, err := ep.GetAccount(address)
	if err != nil {
		fmt.Printf("Error retrieving account info: %s\n\r", err)
		return
	}
	// Get network configuration
	networkConfig, err := ep.GetNetworkConfig()
	if err != nil {
		fmt.Printf("Error retrieving network config: %s\n\r", err)
		return
	}

	// Create a transaction
	tx := &erdgo.Transaction{
		ChainID:  networkConfig.ChainID,
		GasLimit: networkConfig.MinGasLimit,
		GasPrice: networkConfig.MinGasPrice,
		Nonce:    account.Nonce,
		SndAddr:  address,
		RcvAddr:  address,
		Value:    "0",
		Version:  versionForTxHashSigning,
		Options:  optionsForTxHashSigning,
	}
	// Sign the transaction's hash
	err = erdgo.SignTransactionHash(tx, privateKey)
	if err != nil {
		fmt.Printf("Error signing transaction's hash: %s\n\r", err)
		return
	}
	// Broadcast the transaction
	hash, err := ep.SendTransaction(tx)
	if err != nil {
		fmt.Printf("Error sending transaction: %s\n\r", err)
		return
	}
	fmt.Printf("Tx hash: %s\n\r", hash)
	fmt.Println("Waiting 30s for the transaction to be notarized...")
	time.Sleep(time.Second * 30)
	// Get transaction info
	txInfo, err := ep.GetTransactionInfo(hash)
	if err != nil {
		fmt.Printf("Error retrieving transaction info: %s\n\r", err)
		return
	}
	data, err := json.MarshalIndent(txInfo, "", "    ")
	if err != nil {
		fmt.Printf("Error marshalizing tx info: %s\n\r", err)
		return
	}
	fmt.Println(string(data))
}
