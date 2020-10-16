package erdgo

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/binary"
	"encoding/hex"
	"encoding/pem"
	"io/ioutil"
	"os"

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

// GetPrivateKeyFromMnemonic generates a private key based on mnemonic, account and address index
func GetPrivateKeyFromMnemonic(mnemonic string, account, addressIndex uint8) []byte {
	seed := bip39.NewSeed(mnemonic, "")
	egldPath[2] = uint32(account) | hardened
	egldPath[4] = uint32(addressIndex) | hardened
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

// LoadPrivateKeyFromPemFile loads a private key from a .pem file
func LoadPrivateKeyFromPemFile(filename string) ([]byte, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	blk, _ := pem.Decode(data)
	if blk == nil {
		return nil, errInvalidPemFile
	}

	return hex.DecodeString(string(blk.Bytes))
}

// SavePrivateKeyToPemFile saves the private key in a .pem file
func SavePrivateKeyToPemFile(privateKey []byte, filename string) error {
	address, err := GetAddressFromPrivateKey(privateKey)
	if err != nil {
		return err
	}
	if len(privateKey) <= pubkeyLen {
		pubkey, err := Bech32ToPubkey(address)
		if err != nil {
			return err
		}
		privateKey = append(privateKey, pubkey...)
	}
	blk := pem.Block{
		Type:  "PRIVATE KEY for " + address,
		Bytes: []byte(hex.EncodeToString(privateKey)),
	}
	file, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer func() {
		_ = file.Close()
	}()

	return pem.Encode(file, &blk)
}

func derivePrivateKey(seed []byte, path bip32Path) *bip32 {
	b := &bip32{}
	digest := hmac.New(sha512.New, []byte("ed25519 seed"))
	digest.Write(seed)
	intermediary := digest.Sum(nil)
	serializedKeyLen := 32
	serializedChildIndexLen := 4
	hardenedChildPadding := byte(0x00)
	b.Key = intermediary[:serializedKeyLen]
	b.ChainCode = intermediary[serializedKeyLen:]
	for _, childIdx := range path {
		data := make([]byte, 1+serializedKeyLen+4)
		data[0] = hardenedChildPadding
		copy(data[1:1+serializedKeyLen], b.Key)
		binary.BigEndian.PutUint32(data[1+serializedKeyLen:1+serializedKeyLen+serializedChildIndexLen], childIdx)
		digest = hmac.New(sha512.New, b.ChainCode)
		digest.Write(data)
		intermediary = digest.Sum(nil)
		b.Key = intermediary[:serializedKeyLen]
		b.ChainCode = intermediary[serializedKeyLen:]
	}

	return b
}
