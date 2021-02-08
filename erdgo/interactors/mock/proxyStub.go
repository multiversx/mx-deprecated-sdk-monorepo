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
	SendTransactionsCalled func(txs []*data.Transaction) ([]string, error)
}

func (ps *ProxyStub) GetNetworkConfig() (*data.NetworkConfig, error) {
	return ps.GetNetworkConfigCalled()
}

func (ps *ProxyStub) GetAccount(address blockchain.AddressHandler) (*data.Account, error) {
	return ps.GetAccountCalled(address)
}

func (ps *ProxyStub) SendTransaction(tx *data.Transaction) (string, error) {
	return ps.SendTransactionCalled(tx)
}

func (ps *ProxyStub) SendTransactions(txs []*data.Transaction) ([]string, error) {
	return ps.SendTransactionsCalled(txs)
}

// IsInterfaceNil -
func (ps *ProxyStub) IsInterfaceNil() bool {
	return ps == nil
}
