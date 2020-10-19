package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

func main() {
	ep := erdgo.NewElrondProxy("http://localhost:8079")

	// Get latest hyperblock (metachain) nonce
	nonce, err := ep.GetLatestHyperblockNonce()
	if err != nil {
		fmt.Printf("Error retrieving latest block nonce: %s\n\r", err)
		return
	}
	fmt.Printf("Latest hyperblock nonce: %v\n\r", nonce)

	go func() {
		for {
			// Get block info
			block, err := ep.GetHyperblockByNonce(nonce)
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
			nonce--
			if nonce == 0 {
				break
			}
			fmt.Println("Press enter to exit...")
			time.Sleep(time.Second)
		}
	}()

	_, _ = fmt.Scanln()
}
