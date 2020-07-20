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
		_, _ = fmt.Fprintln(os.Stderr, fmt.Sprintf("invalid number of arguments: got %d expected 2 \n", len(os.Args)-1))
		os.Exit(1)
	}

	singleSigner := singlesig.BlsSingleSigner{}

	messageToSign, err := hex.DecodeString(args[1])
	if err != nil {
		_, _ = fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	seed, err := hex.DecodeString(args[2])
	if err != nil {
		_, _ = fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	keyGenerator := signing.NewKeyGenerator(mcl.NewSuiteBLS12())
	privKey, err := keyGenerator.PrivateKeyFromByteArray(seed)
	if err != nil {
		_, _ = fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	signature, err := singleSigner.Sign(privKey, messageToSign)
	if err != nil {
		_, _ = fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	fmt.Print(hex.EncodeToString(signature))
}
