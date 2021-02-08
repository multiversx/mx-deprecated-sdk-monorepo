package blockchain

// AddressHandler defines what an address struct should be able to do
type AddressHandler interface {
	AddressAsBech32String() string
	AddressBytes() []byte
	IsValid() bool
	IsInterfaceNil() bool
}
