package tests

import (
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
	"github.com/stretchr/testify/assert"
)

func TestTransaction_Sign(t *testing.T) {
	t.Parallel()

	pk, err := erdgo.LoadPrivateKeyFromPemFile("alice.pem")

	assert.Nil(t, err)

	tx := &erdgo.Transaction{
		Nonce:    0,
		Value:    "0",
		RcvAddr:  "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
		SndAddr:  "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
		GasPrice: 1000000000,
		GasLimit: 50000,
		ChainID:  "1",
		Version:  1,
	}
	err = erdgo.SignTransaction(tx, pk)

	assert.Nil(t, err)
	assert.Equal(t, tx.Signature, "018f4fa0ff70f9f061ed0ad311ccf77d6e62a673c080a168923002befeb62bedd32758aef68858b1198cec31b106610e8f8c00b4007ad4cca1d86eafcc951204")
}
