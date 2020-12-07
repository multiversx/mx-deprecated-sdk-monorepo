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

func TestWallet_ExportImportJson(t *testing.T) {
	t.Parallel()

	password := "test#password#123"
	pk1 := make([]byte, 32)
	rand.Read(pk1)
	_ = erdgo.SavePrivateKeyToJsonFile(pk1, password, "test.json")
	pk2, err := erdgo.LoadPrivateKeyFromJsonFile("test.json", password)
	_, errWrongPassword := erdgo.LoadPrivateKeyFromJsonFile("test.json", "")

	assert.Nil(t, err)

	addr1, err1 := erdgo.GetAddressFromPrivateKey(pk1)
	addr2, err2 := erdgo.GetAddressFromPrivateKey(pk2)

	assert.Nil(t, err1)
	assert.Nil(t, err2)
	assert.NotEqual(t, errWrongPassword, nil)
	assert.Equal(t, addr1, addr2)
}
