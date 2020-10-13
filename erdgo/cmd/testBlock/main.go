package main

import (
	"encoding/json"
	"fmt"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

func main() {
	// Get latest hyperblock (metachain) nonce
	nonce, err := erdgo.GetLatestHyperblockNonce()
	if err != nil {
		fmt.Printf("Error retrieving latest block nonce: %s\n\r", err)
		return
	}
	fmt.Printf("Latest meta block nonce: %v\n\r", nonce)

	// Get block info
	block, err := erdgo.GetHyperblockByNonce(nonce)
	if err != nil {
		fmt.Printf("Error retrieving hyperblock: %s\n\r", err)
		return
	}
	data, err := json.MarshalIndent(block, "", "    ")
	if err != nil {
		fmt.Printf("Error marshalizing block: %s\n\r", err)
		return
	}
	fmt.Println(string(data))
}
