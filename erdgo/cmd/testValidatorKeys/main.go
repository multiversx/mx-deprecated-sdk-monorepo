package main

import (
	"bytes"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

func main() {
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
	privateKey := erdgo.GetBLSPrivateKeyFromMnemonic(mnemonic, account, addressIndex)
	fmt.Printf("Private key: %s\n\r", hex.EncodeToString(privateKey))

	// Generating public key from the private key
	pubKey, err := erdgo.GetBLSPublicKeyFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error getting pubKey from private key: %s\n\r", err)
		return
	}

	fmt.Printf("Public key: %s\n\r", hex.EncodeToString(pubKey))

	// Save the private key to a .PEM file and reload it
	validatorFilename := fmt.Sprintf("test%v.pem", time.Now().Unix())
	fmt.Printf("PEM file saved as %s\n\r", validatorFilename)
	_ = erdgo.SaveBLSPrivateKeyToPemFile(privateKey, validatorFilename)
	privateKey, err = erdgo.LoadBLSPrivateKeyFromPemFile(validatorFilename)
	// Generate the address from the loaded private key
	pk, err := erdgo.GetBLSPublicKeyFromPrivateKey(privateKey)
	if err != nil {
		fmt.Printf("Error getting public key from private key: %s\n\r", err)
		return
	}
	// Compare the old and new addresses (should match)
	if !bytes.Equal(pubKey, pk) {
		fmt.Printf("Different public keys (%s). Something went wrong\n\r", pk)
	}
}
