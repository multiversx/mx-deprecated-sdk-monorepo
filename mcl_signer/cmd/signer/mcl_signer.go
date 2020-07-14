package main

import (
	"encoding/hex"
	"fmt"
	"os"

	"github.com/ElrondNetwork/elrond-go/crypto/signing"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/mcl"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/mcl/singlesig"
)

func main(){
	args := os.Args

	if len(os.Args) != 3 {
	    fmt.Printf("invalid number of arguments: got %d expected 2 \n", len(os.Args)-1)
	    return
	}

	singleSigner := singlesig.BlsSingleSigner{}

	messageToSign, err := hex.DecodeString(args[1])
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	seed, err := hex.DecodeString(args[2])
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	keyGenerator := signing.NewKeyGenerator(mcl.NewSuiteBLS12())
	privKey, err := keyGenerator.PrivateKeyFromByteArray(seed)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	signedMessage, err := singleSigner.Sign(privKey, messageToSign)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Print(hex.EncodeToString(signedMessage))
}