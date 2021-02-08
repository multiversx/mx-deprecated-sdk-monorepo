package interactors

import (
	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

// Proxy holds the primitive functions that the elrond proxy engine supports & implements
// dependency inversion: blockchain package is considered inner business logic, this package is considered "plugin"
type Proxy interface {
	GetNetworkConfig() (*data.NetworkConfig, error)
	GetAccount(address blockchain.AddressHandler) (*data.Account, error)
	SendTransaction(tx *data.Transaction) (string, error)
	IsInterfaceNil() bool
}

// TxSigner defines the method used by a struct used to create valid signatures
type TxSigner interface {
	SignMessage(msg []byte, skBytes []byte) ([]byte, error)
	GeneratePkBytes(skBytes []byte) ([]byte, error)
	IsInterfaceNil() bool
}
