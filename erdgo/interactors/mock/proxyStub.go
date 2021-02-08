package mock

import (
	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

// ProxyStub -
type ProxyStub struct {
	GetNetworkConfigCalled func() (*data.NetworkConfig, error)
	GetAccountCalled       func(address blockchain.AddressHandler) (*data.Account, error)
	SendTransactionCalled  func(tx *data.Transaction) (string, error)
}

func (ps *ProxyStub) GetNetworkConfig() (*data.NetworkConfig, error) {
	panic("implement me")
}

func (ps *ProxyStub) GetAccount(address blockchain.AddressHandler) (*data.Account, error) {
	panic("implement me")
}

func (ps *ProxyStub) SendTransaction(tx *data.Transaction) (string, error) {
	panic("implement me")
}

// IsInterfaceNil -
func (ps *ProxyStub) IsInterfaceNil() bool {
	return ps == nil
}
