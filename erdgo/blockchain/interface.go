package blockchain

type addressHandler interface {
	AddressAsBech32String() string
	AddressBytes() []byte
	IsValid() bool
	IsInterfaceNil() bool
}
