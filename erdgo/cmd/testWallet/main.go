package main

import (
	"encoding/hex"
	"fmt"
	"time"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

func main() {
	ep := erdgo.NewElrondProxy("http://174.138.103.62:8079")

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
	address, err := erdgo.GetAddressFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error getting address from private key: %s\n\r", err)
		return
	}
	// Convert address to pubkey
	pubkey, err := erdgo.Bech32ToPubkey(address)
	if err != nil {
		fmt.Printf("Error converting address to pubkey: %s\n\r", err)
		return
	}
	fmt.Printf("Public key: %s\n\r", hex.EncodeToString(pubkey))

	// Retrieving network configuration parameters
	networkConfig, err := ep.GetNetworkConfig()
	if err != nil {
		fmt.Printf("Error getting network config: %s\n\r", err)
		return
	}
	// Computing the shard ID of the address
	shard, err := erdgo.GetAddressShard(address, networkConfig.NumShardsWithoutMeta)

	fmt.Printf("Address: %s on shard %v\n\r", address, shard)

	// Save the private key to a .PEM file and reload it
	walletFilename := fmt.Sprintf("test%v.pem", time.Now().Unix())
	fmt.Printf("PEM file saved as %s\n\r", walletFilename)
	_ = erdgo.SavePrivateKeyToPemFile(privateKey, walletFilename)
	privateKey, err = erdgo.LoadPrivateKeyFromPemFile(walletFilename)
	// Generate the address from the loaded private key
	address2, err := erdgo.GetAddressFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error getting address from private key: %s\n\r", err)
		return
	}
	// Compare the old and new addresses (should match)
	if address != address2 {
		fmt.Printf("Different address (%s). Something went wrong\n\r", address2)
		return
	}
}
