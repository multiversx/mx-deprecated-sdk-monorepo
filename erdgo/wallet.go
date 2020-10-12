package erdgo

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/binary"

	"github.com/ElrondNetwork/elrond-go/crypto/signing"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/ed25519"
	"github.com/tyler-smith/go-bip39"
)

const (
	egldCoinType = uint32(508)
	hardened     = uint32(0x80000000)
)

type bip32Path []uint32

type bip32 struct {
	Key       []byte
	ChainCode []byte
}

var egldPath = bip32Path{
	44 | hardened,
	egldCoinType | hardened,
	hardened, // account
	hardened,
	hardened, // addressIndex
}

// GenerateNewMnemonic generates a new set of 24 words to be used as seed phrase
func GenerateNewMnemonic() (string, error) {
	entropy, err := bip39.NewEntropy(256)
	if err != nil {
		return "", err
	}

	return bip39.NewMnemonic(entropy)
}

// GetPrivateKeyFromMnemonic generates a private key based on mnemonic, accound and address index
func GetPrivateKeyFromMnemonic(mnemonic string, account, addressIndex uint32) []byte {
	seed := bip39.NewSeed(mnemonic, "")
	egldPath[2] = account | hardened
	egldPath[4] = addressIndex | hardened
	keyData := derivePrivateKey(seed, egldPath)

	return keyData.Key
}

// GetAddressFromPrivateKey generates the bech32 address from a private key
func GetAddressFromPrivateKey(privateKeyBytes []byte) (string, error) {
	suite := ed25519.NewEd25519()
	keyGen := signing.NewKeyGenerator(suite)
	privateKey, err := keyGen.PrivateKeyFromByteArray(privateKeyBytes)
	if err != nil {
		return "", err
	}
	publicKey := privateKey.GeneratePublic()
	publicKeyBytes, err := publicKey.ToByteArray()
	if err != nil {
		return "", err
	}

	return PubkeyToBech32(publicKeyBytes)
}

func derivePrivateKey(seed []byte, path bip32Path) *bip32 {
	b := &bip32{}
	digest := hmac.New(sha512.New, []byte("ed25519 seed"))
	digest.Write(seed)
	intermediary := digest.Sum(nil)
	b.Key = intermediary[:32]
	b.ChainCode = intermediary[32:]
	for _, childIdx := range path {
		data := make([]byte, 1+32+4)
		data[0] = 0x00
		copy(data[1:1+32], b.Key)
		binary.BigEndian.PutUint32(data[1+32:1+32+4], childIdx)
		digest = hmac.New(sha512.New, b.ChainCode)
		digest.Write(data)
		intermediary = digest.Sum(nil)
		b.Key = intermediary[:32]
		b.ChainCode = intermediary[32:]
	}

	return b
}
