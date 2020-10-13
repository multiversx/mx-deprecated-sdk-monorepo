package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

func main() {
	// Load a wallet .PEM file
	privateKey, err := erdgo.LoadPrivateKeyFromPemFile("walletKey.pem")
	if err != nil {
		fmt.Printf("Unable to load walletKey.pem: %s\n\r", err)
		return
	}
	// Generate address from private key
	address, err := erdgo.GetAddressFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error generating address: %s\n\r", err)
		return
	}
	// Get account info
	account, err := erdgo.GetAccount(address)
	if err != nil {
		fmt.Printf("Error retrieving account info: %s\n\r", err)
		return
	}
	// Get network configuration
	networkConfig, err := erdgo.GetNetworkConfig()
	if err != nil {
		fmt.Printf("Error retrieving network config: %s\n\r", err)
		return
	}

	// Create a transaction
	tx := &erdgo.Transaction{
		ChainID:  networkConfig.ChainID,
		Version:  networkConfig.MinTransactionVersion,
		GasLimit: networkConfig.MinGasLimit,
		GasPrice: networkConfig.MinGasPrice,
		Nonce:    account.Nonce,
		SndAddr:  address,
		RcvAddr:  address,
		Value:    "0",
	}
	// Sign the transaction
	err = erdgo.SignTransaction(tx, privateKey)
	if err != nil {
		fmt.Printf("Error signing transaction: %s\n\r", err)
		return
	}
	// Broadcast the transaction
	hash, err := erdgo.SendTransaction(tx)
	if err != nil {
		fmt.Printf("Error sending transaction: %s\n\r", err)
		return
	}
	fmt.Printf("Tx hash: %s\n\r", hash)
	fmt.Println("Waiting 30s for the transaction to be notarized...")
	time.Sleep(time.Second * 30)
	// Get transaction info
	txInfo, err := erdgo.GetTransactionInfo(hash)
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
