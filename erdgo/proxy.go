package erdgo

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

const (
	metachainID = 4294967295

	// endpoints
	networkConfigEndpoint        = "network/config"
	accountEndpoint              = "address/%s"
	sendTransactionEndpoint      = "transaction/send"
	getTransactionStatusEndpoint = "transaction/%s/status"
	getTransactionInfoEndpoint   = "transaction/%s"
	getHyperblockByNonceEndpoint = "hyperblock/by-nonce/%v"
	getHyperblockByHashEndpoint  = "hyperblock/by-hash/%s"
	getNetworkStatusEndpoint     = "network/status/%v"
)

// ElrondProxy implements basic functions for interacting with an Elrond Proxy
type ElrondProxy struct {
	proxyURL string
}

// NewElrondProxy initializes and returns an ElrondProxy object
func NewElrondProxy(url string) *ElrondProxy {
	ep := &ElrondProxy{
		proxyURL: url,
	}

	return ep
}

// GetNetworkConfig retrieves the network configuration from the proxy
func (ep *ElrondProxy) GetNetworkConfig() (*NetworkConfig, error) {
	data, err := ep.getHTTP(networkConfigEndpoint)
	if err != nil {
		return nil, err
	}
	response := &NetworkConfigResponse{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response.Data.Config, nil
}

// GetAccount retrieves an account info from the network (nonce, balance)
func (ep *ElrondProxy) GetAccount(address string) (*Account, error) {
	if !IsValidBech32Address(address) {
		return nil, errInvalidAddress
	}
	endpoint := fmt.Sprintf(accountEndpoint, address)
	data, err := ep.getHTTP(endpoint)
	if err != nil {
		return nil, err
	}
	response := &AccountResponse{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response.Data.Account, nil
}

// SendTransaction broadcasts a transaction to the network and returns the txhash if successful
func (ep *ElrondProxy) SendTransaction(tx *Transaction) (string, error) {
	jsonTx, err := json.Marshal(tx)
	if err != nil {
		return "", err
	}
	data, err := ep.postHTTP(sendTransactionEndpoint, jsonTx)
	if err != nil {
		return "", err
	}
	response := &SendTransactionResponse{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return "", err
	}
	if response.Error != "" {
		return "", errors.New(response.Error)
	}

	return response.Data.TxHash, nil
}

// GetTransactionStatus retrieves a transaction's status from the network
func (ep *ElrondProxy) GetTransactionStatus(hash string) (string, error) {
	endpoint := fmt.Sprintf(getTransactionStatusEndpoint, hash)
	data, err := ep.getHTTP(endpoint)
	if err != nil {
		return "", err
	}
	response := &TransactionStatus{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return "", err
	}
	if response.Error != "" {
		return "", errors.New(response.Error)
	}

	return response.Data.Status, nil
}

// GetTransactionInfo retrieves a transaction's details from the network
func (ep *ElrondProxy) GetTransactionInfo(hash string) (*TransactionInfo, error) {
	endpoint := fmt.Sprintf(getTransactionInfoEndpoint, hash)
	data, err := ep.getHTTP(endpoint)
	if err != nil {
		return nil, err
	}
	response := &TransactionInfo{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return response, nil
}

// GetLatestHyperblockNonce retrieves the latest hyperblock (metachain) nonce from the network
func (ep *ElrondProxy) GetLatestHyperblockNonce() (uint64, error) {
	endpoint := fmt.Sprintf(getNetworkStatusEndpoint, metachainID)
	data, err := ep.getHTTP(endpoint)
	if err != nil {
		return 0, err
	}
	response := &NetworkStatusResponse{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return 0, err
	}
	if response.Error != "" {
		return 0, errors.New(response.Error)
	}

	return response.Data.Status.Nonce, nil
}

// GetHyperblockByNonce retrieves a hyperblock's info by nonce from the network
func (ep *ElrondProxy) GetHyperblockByNonce(nonce uint64) (*Hyperblock, error) {
	endpoint := fmt.Sprintf(getHyperblockByNonceEndpoint, nonce)

	return ep.getHyperblock(endpoint)
}

// GetHyperblockByHash retrieves a hyperblock's info by hash from the network
func (ep *ElrondProxy) GetHyperblockByHash(hash string) (*Hyperblock, error) {
	endpoint := fmt.Sprintf(getHyperblockByHashEndpoint, hash)

	return ep.getHyperblock(endpoint)
}

func (ep *ElrondProxy) getHyperblock(endpoint string) (*Hyperblock, error) {
	data, err := ep.getHTTP(endpoint)
	if err != nil {
		return nil, err
	}
	response := &HyperblockResponse{}
	err = json.Unmarshal(data, response)
	if err != nil {
		return nil, err
	}
	if response.Error != "" {
		return nil, errors.New(response.Error)
	}

	return &response.Data.Hyperblock, nil
}

func (ep *ElrondProxy) getHTTP(endpoint string) ([]byte, error) {
	url := fmt.Sprintf("%s/%s", ep.proxyURL, endpoint)
	request, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	client := http.DefaultClient
	response, err := client.Do(request)
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

func (ep *ElrondProxy) postHTTP(endpoint string, data []byte) ([]byte, error) {
	url := fmt.Sprintf("%s/%s", ep.proxyURL, endpoint)
	response, err := http.Post(url, "", strings.NewReader(string(data)))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = response.Body.Close()
	}()

	return ioutil.ReadAll(response.Body)
}
