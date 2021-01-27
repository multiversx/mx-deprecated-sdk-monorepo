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
	"github.com/ElrondNetwork/elrond-go/crypto/signing/mcl"
	"github.com/tyler-smith/go-bip39"
)

const (
	blsPubKeyLen = 96
)

// GetBLSPrivateKeyFromMnemonic generates a private key based on mnemonic, account and address index
func GetBLSPrivateKeyFromMnemonic(mnemonic string, account, addressIndex uint8) []byte {
	seed := bip39.NewSeed(mnemonic, "")
	egldPath[2] = uint32(account) | hardened
	egldPath[4] = uint32(addressIndex) | hardened
	keyData := deriveBLSPrivateKey(seed, egldPath)

	return keyData.Key
}

// GetBLSPublicKeyFromPrivateKey generates the public key from a private key
func GetBLSPublicKeyFromPrivateKey(privateKeyBytes []byte) ([]byte, error) {
	suite := mcl.NewSuiteBLS12()
	keyGen := signing.NewKeyGenerator(suite)

	privateKey, err := keyGen.PrivateKeyFromByteArray(privateKeyBytes)
	if err != nil {
		return nil, err
	}
	publicKey := privateKey.GeneratePublic()
	publicKeyBytes, err := publicKey.ToByteArray()
	if err != nil {
		return nil, err
	}

	return publicKeyBytes, nil
}

// LoadBLSPrivateKeyFromPemFile loads a private key from a .pem file
func LoadBLSPrivateKeyFromPemFile(filename string) ([]byte, error) {
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

// SaveBLSPrivateKeyToPemFile saves the private key in a .pem file
func SaveBLSPrivateKeyToPemFile(privateKey []byte, filename string) error {
	pubKey, err := GetBLSPublicKeyFromPrivateKey(privateKey)
	if err != nil {
		return err
	}

	hexBLSPubKey := hex.EncodeToString(pubKey)
	blk := pem.Block{
		Type:  "PRIVATE KEY for " + hexBLSPubKey,
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

func deriveBLSPrivateKey(seed []byte, path bip32Path) *bip32 {
	b := &bip32{}
	digest := hmac.New(sha512.New, []byte("BLS12-381 seed"))
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