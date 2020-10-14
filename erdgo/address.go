package erdgo

import (
	"encoding/hex"
	"math"

	"github.com/btcsuite/btcutil/bech32"
)

const (
	bech32Hrp        = "erd"
	bech32AddressLen = 62
	pubkeyLen        = 32
)

// IsValidBech32Address returns true if the provided parameter is a valid Elrond bech32 address and false otherwise
func IsValidBech32Address(address string) bool {
	hrp, bytes, err := bech32.Decode(address)
	if err != nil || hrp != bech32Hrp {
		return false
	}
	pubkey, err := bech32.ConvertBits(bytes, 5, 8, false)
	if err != nil {
		return false
	}

	return len(address) == bech32AddressLen && len(pubkey) == pubkeyLen
}

// IsValidPubkey returns true if the provided parameter is a valid pubkey and false otherwise
func IsValidPubkey(strPubkey string) bool {
	bytes, err := hex.DecodeString(strPubkey)
	if err != nil {
		return false
	}

	return len(bytes) == pubkeyLen
}

// PubkeyToBech32 converts a pubkey to an Elrond bech32 address
func PubkeyToBech32(pubkey []byte) (string, error) {
	if !IsValidPubkey(hex.EncodeToString(pubkey)) {
		return "", errInvalidPubkey
	}
	bytes, err := bech32.ConvertBits(pubkey, 8, 5, true)
	if err != nil {
		return "", err
	}
	address, err := bech32.Encode(bech32Hrp, bytes)
	if err != nil {
		return "", err
	}

	return address, nil
}

// Bech32ToPubkey converts an Elrond bech32 address to a pubkey
func Bech32ToPubkey(address string) ([]byte, error) {
	if !IsValidBech32Address(address) {
		return nil, errInvalidAddress
	}
	_, bytes, _ := bech32.Decode(address)
	pubkey, _ := bech32.ConvertBits(bytes, 5, 8, false)

	return pubkey, nil
}

// GetAddressShard computes the shard of an address
func GetAddressShard(address string, numShardsWithoutMeta uint32) (uint32, error) {
	if !IsValidBech32Address(address) {
		return 0, errInvalidAddress
	}
	n := math.Ceil(math.Log2(float64(numShardsWithoutMeta)))
	var maskHigh, maskLow uint32 = (1 << uint(n)) - 1, (1 << uint(n-1)) - 1
	pubkey, _ := Bech32ToPubkey(address)
	addr := uint32(pubkey[len(pubkey)-1])
	shard := addr & maskHigh
	if shard > numShardsWithoutMeta-1 {
		shard = addr & maskLow
	}

	return shard, nil
}
