package data

import "github.com/ElrondNetwork/elrond-sdk/erdgo/core"

type address struct {
	bytes []byte
}

// NewAddressFromBytes returns a new address from provided bytes
func NewAddressFromBytes(bytes []byte) *address {
	addr := &address{
		bytes: make([]byte, len(bytes)),
	}
	copy(addr.bytes, bytes)

	return addr
}

// NewAddressFromBech32String returns a new address from provided bech32 string
func NewAddressFromBech32String(bech32 string) (*address, error) {
	buff, err := core.AddressPublicKeyConverter.Decode(bech32)
	if err != nil {
		return nil, err
	}

	return &address{
		bytes: buff,
	}, err
}

// AddressAsBech32String returns the address as a bech32 string
func (a *address) AddressAsBech32String() string {
	return core.AddressPublicKeyConverter.Encode(a.bytes)
}

// AddressBytes returns the raw address' bytes
func (a *address) AddressBytes() []byte {
	return a.bytes
}

// IsValid returns true if the contained address is valid
func (a *address) IsValid() bool {
	return len(a.bytes) == core.AddressLen
}

// IsInterfaceNil returns true if there is no value under the interface
func (a *address) IsInterfaceNil() bool {
	return a == nil
}
