package main

import (
	"bytes"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

func main() {
	ep := blockchain.NewElrondProxy("http://localhost:8079")

	// Generating new mnemonic wallet
	mnemonic, err := erdgo.GenerateNewMnemonic()
	if err != nil {
		fmt.Printf("Error generating new mnemonic: %s\n\r", err)
		return
	}
	fmt.Printf("Mnemonics: %s\n\r", mnemonic)

	// Generating private key for account 0, address index 0 (based on the previous mnemonic)
	account := uint8(0)
	addressIndex := uint8(0)
	privateKey := erdgo.GetPrivateKeyFromMnemonic(mnemonic, account, addressIndex)
	fmt.Printf("Private key: %s\n\r", hex.EncodeToString(privateKey))
	// Generating wallet address from the private key
	addressString, err := erdgo.GetAddressFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error getting address from private key: %s\n\r", err)
		return
	}

	address, err := data.NewAddressFromBech32String(addressString)
	if err != nil {
		fmt.Printf("Error converting address to pubkey: %s\n\r", err)
		return
	}
	fmt.Printf("Public key: %s\n\r", hex.EncodeToString(address.AddressBytes()))

	// Retrieving network configuration parameters
	networkConfig, err := ep.GetNetworkConfig()
	if err != nil {
		fmt.Printf("Error getting network config: %s\n\r", err)
		return
	}

	shardCoordinator, err := blockchain.NewShardCoordinator(networkConfig.NumShardsWithoutMeta, 0)
	if err != nil {
		fmt.Printf("Error creating shard coordinator: %s\n\r", err)
		return
	}
	// Computing the shard ID of the address
	shard, err := shardCoordinator.ComputeShardId(address)
	fmt.Printf("Address: %s on shard %v\n\r", address, shard)

	// Save the private key to a .PEM file and reload it
	walletFilename := fmt.Sprintf("test%v.pem", time.Now().Unix())
	fmt.Printf("PEM file saved as %s\n\r", walletFilename)
	_ = erdgo.SavePrivateKeyToPemFile(privateKey, walletFilename)
	privateKey, err = erdgo.LoadPrivateKeyFromPemFile(walletFilename)
	// Generate the address from the loaded private key
	address2String, err := erdgo.GetAddressFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error getting address from private key: %s\n\r", err)
		return
	}

	address2, err := data.NewAddressFromBech32String(address2String)
	if err != nil {
		fmt.Printf("Error converting address to pubkey: %s\n\r", err)
		return
	}

	// Compare the old and new addresses (should match)
	if !bytes.Equal(address.AddressBytes(), address2.AddressBytes()) {
		fmt.Printf("Different address (%s). Something went wrong\n\r", address2)
		return
	}
}
