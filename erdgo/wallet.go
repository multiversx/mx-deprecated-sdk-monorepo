package erdgo

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"io"
	"io/ioutil"
	"os"

	"github.com/ElrondNetwork/elrond-go/core/pubkeyConverter"
	"github.com/ElrondNetwork/elrond-go/crypto/signing"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/ed25519"
	"github.com/pborman/uuid"
	"github.com/tyler-smith/go-bip39"
	"golang.org/x/crypto/scrypt"
)

//TODO: refactor this file

const addressLen = 32

var addrPkConv, _ = pubkeyConverter.NewBech32PubkeyConverter(addressLen)

const (
	egldCoinType = uint32(508)
	hardened     = uint32(0x80000000)

	keystoreVersion = 4
	keyHeaderKDF    = "scrypt"
	scryptN         = 4096
	scryptR         = 8
	scryptP         = 1
	scryptDKLen     = 32
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

type encryptedKeyJSONV4 struct {
	Address string `json:"address"`
	Bech32  string `json:"bech32"`
	Crypto  struct {
		Cipher       string `json:"cipher"`
		CipherText   string `json:"ciphertext"`
		CipherParams struct {
			IV string `json:"iv"`
		} `json:"cipherparams"`
		KDF       string `json:"kdf"`
		KDFParams struct {
			DkLen int    `json:"dklen"`
			Salt  string `json:"salt"`
			N     int    `json:"n"`
			R     int    `json:"r"`
			P     int    `json:"p"`
		} `json:"kdfparams"`
		MAC string `json:"mac"`
	} `json:"crypto"`
	Id      string `json:"id"`
	Version int    `json:"version"`
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

	return addrPkConv.Encode(publicKeyBytes), nil
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
	if len(privateKey) <= addressLen {
		pubkey, err := addrPkConv.Decode(address)
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

// LoadPrivateKeyFromJsonFile loads a password encrypted private key from a .json file
func LoadPrivateKeyFromJsonFile(filename string, password string) ([]byte, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	key := &encryptedKeyJSONV4{}
	err = json.Unmarshal(data, key)
	if err != nil {
		return nil, err
	}

	mac, err := hex.DecodeString(key.Crypto.MAC)
	if err != nil {
		return nil, err
	}

	iv, err := hex.DecodeString(key.Crypto.CipherParams.IV)
	if err != nil {
		return nil, err
	}

	cipherText, err := hex.DecodeString(key.Crypto.CipherText)
	if err != nil {
		return nil, err
	}

	salt, err := hex.DecodeString(key.Crypto.KDFParams.Salt)
	if err != nil {
		return nil, err
	}

	derivedKey, err := scrypt.Key([]byte(password), salt,
		key.Crypto.KDFParams.N,
		key.Crypto.KDFParams.R,
		key.Crypto.KDFParams.P,
		key.Crypto.KDFParams.DkLen)
	if err != nil {
		return nil, err
	}

	hash := hmac.New(sha256.New, derivedKey[16:32])
	_, err = hash.Write(cipherText)
	if err != nil {
		return nil, err
	}

	sha := hash.Sum(nil)
	if !bytes.Equal(sha, mac) {
		return nil, errWrongPassword
	}

	aesBlock, err := aes.NewCipher(derivedKey[:16])
	if err != nil {
		return nil, err
	}

	stream := cipher.NewCTR(aesBlock, iv)
	privateKey := make([]byte, len(cipherText))
	stream.XORKeyStream(privateKey, cipherText)

	address, err := GetAddressFromPrivateKey(privateKey)
	if err != nil {
		return nil, err
	}

	publicKey, err := addrPkConv.Decode(address)
	if err != nil {
		return nil, err
	}

	isSameAccount := hex.EncodeToString(publicKey) == key.Address && address == key.Bech32
	if !isSameAccount {
		return nil, errWrongAccount
	}

	return privateKey, nil
}

// SavePrivateKeyToJsonFile saves a password encrypted private key to a .json file
func SavePrivateKeyToJsonFile(privateKey []byte, password string, filename string) error {
	salt := make([]byte, 32)
	_, err := io.ReadFull(rand.Reader, salt)
	if err != nil {
		return err
	}

	derivedKey, err := scrypt.Key([]byte(password), salt, scryptN, scryptR, scryptP, scryptDKLen)
	if err != nil {
		return err
	}

	encryptKey := derivedKey[:16]
	iv := make([]byte, aes.BlockSize) // 16
	_, err = io.ReadFull(rand.Reader, iv)
	if err != nil {
		return err
	}

	aesBlock, err := aes.NewCipher(encryptKey)
	if err != nil {
		return err
	}

	stream := cipher.NewCTR(aesBlock, iv)
	cipherText := make([]byte, len(privateKey))
	stream.XORKeyStream(cipherText, privateKey)

	hash := hmac.New(sha256.New, derivedKey[16:32])
	_, err = hash.Write(cipherText)
	if err != nil {
		return err
	}

	mac := hash.Sum(nil)

	address, err := GetAddressFromPrivateKey(privateKey)
	if err != nil {
		return err
	}

	publicKey, err := addrPkConv.Decode(address)
	if err != nil {
		return err
	}

	keystoreJson := &encryptedKeyJSONV4{
		Bech32:  address,
		Address: hex.EncodeToString(publicKey),
		Version: keystoreVersion,
		Id:      uuid.New(),
	}
	keystoreJson.Crypto.CipherParams.IV = hex.EncodeToString(iv)
	keystoreJson.Crypto.Cipher = "aes-128-ctr"
	keystoreJson.Crypto.CipherText = hex.EncodeToString(cipherText)
	keystoreJson.Crypto.KDF = keyHeaderKDF
	keystoreJson.Crypto.MAC = hex.EncodeToString(mac)
	keystoreJson.Crypto.KDFParams.N = scryptN
	keystoreJson.Crypto.KDFParams.R = scryptR
	keystoreJson.Crypto.KDFParams.P = scryptP
	keystoreJson.Crypto.KDFParams.DkLen = scryptDKLen
	keystoreJson.Crypto.KDFParams.Salt = hex.EncodeToString(salt)

	data, err := json.Marshal(keystoreJson)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(filename, data, 0644)
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
