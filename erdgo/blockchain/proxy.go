package blockchain

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/ElrondNetwork/elrond-go/core"
	"github.com/ElrondNetwork/elrond-go/core/check"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

const (
	// endpoints
	networkConfigEndpoint        = "network/config"
	networkEconomicsEndpoint     = "network/economics"
	accountEndpoint              = "address/%s"
	costTransactionEndpoint      = "transaction/cost"
	sendTransactionEndpoint      = "transaction/send"
	getTransactionStatusEndpoint = "transaction/%s/status"
	getTransactionInfoEndpoint   = "transaction/%s"
	getHyperblockByNonceEndpoint = "hyperblock/by-nonce/%v"
	getHyperblockByHashEndpoint  = "hyperblock/by-hash/%s"
	getNetworkStatusEndpoint     = "network/status/%v"
	withResultsQueryParam        = "?withResults=true"
	vmValuesEndpoint             = "vm-values/query"
)

// HTTPClient is the interface we expect to call in order to do the HTTP requests
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

// elrondProxy implements basic functions for interacting with an Elrond Proxy
type elrondProxy struct {
	proxyURL string
	client   HTTPClient
}

// NewElrondProxy initializes and returns an ElrondProxy object
func NewElrondProxy(url string, client HTTPClient) *elrondProxy {
	if check.IfNilReflect(client) {
		client = http.DefaultClient
	}

	ep := &elrondProxy{
		proxyURL: url,
		client:   client,
	}

	return ep
}

// ExecuteVMQuery retrieves data from existing SC trie through the use of a VM
func (ep *elrondProxy) ExecuteVMQuery(vmRequest *data.VmValueRequest) (*data.VmValuesResponseData, error) {
	jsonVMRequest, err := json.Marshal(vmRequest)
	if err != nil {
		return nil, err
	}

	buff, err := ep.postHTTP(vmValuesEndpoint, jsonVMRequest)
	if err != nil {
		return nil, err
	}

	response := &data.ResponseVmValue{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return &response.Data, nil
}

// GetNetworkConfig retrieves the network configuration from the proxy
func (ep *elrondProxy) GetNetworkConfig() (*data.NetworkConfig, error) {
	buff, err := ep.getHTTP(networkConfigEndpoint)
	if err != nil {
		return nil, err
	}

	response := &data.NetworkConfigResponse{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response.Data.Config, nil
}

// GetNetworkEconomics retrieves the network economics from the proxy
func (ep *elrondProxy) GetNetworkEconomics() (*data.NetworkEconomics, error) {
	buff, err := ep.getHTTP(networkEconomicsEndpoint)
	if err != nil {
		return nil, err
	}

	response := &data.NetworkEconomicsResponse{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response.Data.Economics, nil
}

// GetAccount retrieves an account info from the network (nonce, balance)
func (ep *elrondProxy) GetAccount(address addressHandler) (*data.Account, error) {
	if check.IfNil(address) {
		return nil, ErrNilAddress
	}
	if !address.IsValid() {
		return nil, ErrInvalidAddress
	}
	endpoint := fmt.Sprintf(accountEndpoint, address.AddressAsBech32String())

	buff, err := ep.getHTTP(endpoint)
	if err != nil {
		return nil, err
	}
	response := &data.AccountResponse{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response.Data.Account, nil
}

// SendTransaction broadcasts a transaction to the network and returns the txhash if successful
func (ep *elrondProxy) SendTransaction(tx *data.Transaction) (string, error) {
	jsonTx, err := json.Marshal(tx)
	if err != nil {
		return "", err
	}
	buff, err := ep.postHTTP(sendTransactionEndpoint, jsonTx)
	if err != nil {
		return "", err
	}

	response := &data.SendTransactionResponse{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return "", err
	}
	if response.Error != "" {
		return "", errors.New(response.Error)
	}

	return response.Data.TxHash, nil
}

// GetTransactionStatus retrieves a transaction's status from the network
func (ep *elrondProxy) GetTransactionStatus(hash string) (string, error) {
	endpoint := fmt.Sprintf(getTransactionStatusEndpoint, hash)
	buff, err := ep.getHTTP(endpoint)
	if err != nil {
		return "", err
	}

	response := &data.TransactionStatus{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return "", err
	}
	if response.Error != "" {
		return "", errors.New(response.Error)
	}

	return response.Data.Status, nil
}

// GetTransactionInfo retrieves a transaction's details from the network
func (ep *elrondProxy) GetTransactionInfo(hash string) (*data.TransactionInfo, error) {
	return ep.getTransactionInfo(hash, false)
}

// GetTransactionInfoWithResults retrieves a transaction's details from the network with events
func (ep *elrondProxy) GetTransactionInfoWithResults(hash string) (*data.TransactionInfo, error) {
	return ep.getTransactionInfo(hash, true)
}

func (ep *elrondProxy) getTransactionInfo(hash string, withResults bool) (*data.TransactionInfo, error) {
	endpoint := fmt.Sprintf(getTransactionInfoEndpoint, hash)

	if withResults {
		endpoint += withResultsQueryParam
	}

	buff, err := ep.getHTTP(endpoint)
	if err != nil {
		return nil, err
	}

	response := &data.TransactionInfo{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response, nil
}

func (ep *elrondProxy) RequestTransactionCost(tx *data.Transaction) (*data.TxCostResponseData, error) {
	jsonTx, err := json.Marshal(tx)
	if err != nil {
		return nil, err
	}
	buff, err := ep.postHTTP(costTransactionEndpoint, jsonTx)
	if err != nil {
		return nil, err
	}

	response := &data.ResponseTxCost{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return &response.Data, nil
}

// GetLatestHyperblockNonce retrieves the latest hyperblock (metachain) nonce from the network
func (ep *elrondProxy) GetLatestHyperblockNonce() (uint64, error) {
	endpoint := fmt.Sprintf(getNetworkStatusEndpoint, core.MetachainShardId)
	buff, err := ep.getHTTP(endpoint)
	if err != nil {
		return 0, err
	}

	response := &data.NetworkStatusResponse{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return 0, err
	}
	if response.Error != "" {
		return 0, errors.New(response.Error)
	}

	return response.Data.Status.Nonce, nil
}

// GetHyperblockByNonce retrieves a hyperblock's info by nonce from the network
func (ep *elrondProxy) GetHyperblockByNonce(nonce uint64) (*data.Hyperblock, error) {
	endpoint := fmt.Sprintf(getHyperblockByNonceEndpoint, nonce)

	return ep.getHyperblock(endpoint)
}

// GetHyperblockByHash retrieves a hyperblock's info by hash from the network
func (ep *elrondProxy) GetHyperblockByHash(hash string) (*data.Hyperblock, error) {
	endpoint := fmt.Sprintf(getHyperblockByHashEndpoint, hash)

	return ep.getHyperblock(endpoint)
}

func (ep *elrondProxy) getHyperblock(endpoint string) (*data.Hyperblock, error) {
	buff, err := ep.getHTTP(endpoint)
	if err != nil {
		return nil, err
	}

	response := &data.HyperblockResponse{}
	err = json.Unmarshal(buff, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return &response.Data.Hyperblock, nil
}

func (ep *elrondProxy) getHTTP(endpoint string) ([]byte, error) {
	url := fmt.Sprintf("%s/%s", ep.proxyURL, endpoint)
	request, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	response, err := ep.client.Do(request)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = response.Body.Close()
	}()

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func (ep *elrondProxy) postHTTP(endpoint string, data []byte) ([]byte, error) {
	url := fmt.Sprintf("%s/%s", ep.proxyURL, endpoint)
	request, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Content-Type", "")
	response, err := ep.client.Do(request)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = response.Body.Close()
	}()

	return ioutil.ReadAll(response.Body)
}
