package tests

import (
	"math/rand"
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
	"github.com/stretchr/testify/assert"
)

func TestWallet_CreateNewWallet(t *testing.T) {
	t.Parallel()

	mnemonic, errMnemonic := erdgo.GenerateNewMnemonic()
	pk := erdgo.GetPrivateKeyFromMnemonic(mnemonic, 0, 0)
	_, errAddress := erdgo.GetAddressFromPrivateKey(pk)

	assert.Nil(t, errMnemonic)
	assert.Nil(t, errAddress)
}

func TestWallet_ExportImport(t *testing.T) {
	t.Parallel()

	pk1 := make([]byte, 32)
	rand.Read(pk1)
	_ = erdgo.SavePrivateKeyToPemFile(pk1, "test.pem")
	pk2, err := erdgo.LoadPrivateKeyFromPemFile("test.pem")

	assert.Nil(t, err)

	addr1, err1 := erdgo.GetAddressFromPrivateKey(pk1)
	addr2, err2 := erdgo.GetAddressFromPrivateKey(pk2)

	assert.Nil(t, err1)
	assert.Nil(t, err2)
	assert.Equal(t, addr1, addr2)
}
