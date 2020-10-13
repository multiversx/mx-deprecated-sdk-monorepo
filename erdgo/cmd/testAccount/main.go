package main

import (
	"fmt"
	"math/big"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
)

func main() {
	// Retrieving network configuration parameters
	networkConfig, err := erdgo.GetNetworkConfig()
	if err != nil {
		fmt.Printf("Error getting network config: %s\n\r", err)
		return
	}

	address := "erd18yddfyzyskajjteyj90ueackpcsp9set2ma8vp54cj4zh54hjussukc6mu"
	// Retrieve account info from the network (balance, nonce)
	accountInfo, err := erdgo.GetAccount(address)
	if err != nil {
		fmt.Printf("Error retrieving account info: %s\n\r", err)
		return
	}
	balance, ok := big.NewFloat(0).SetString(accountInfo.Balance)
	if !ok {
		fmt.Printf("Invalid balance value: %s\n\r", err)
		return
	}
	// Compute denominated balance to 18 decimals
	denomination := big.NewInt(int64(networkConfig.Denomination))
	denominationMultiplier := big.NewInt(10)
	denominationMultiplier.Exp(denominationMultiplier, denomination, nil)
	floatDenom, _ := big.NewFloat(0).SetString(denominationMultiplier.String())
	balance.Quo(balance, floatDenom)
	floatBalance, _ := balance.Float64()

	fmt.Printf("Address: %s\n\rBalance: %.6f eGLD\n\rNonce: %v\n\r",
		address, floatBalance, accountInfo.Nonce)
}
