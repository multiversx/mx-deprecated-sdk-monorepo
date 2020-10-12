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
	proxyURL = "https://api-testnet.elrond.com"
	// endpoints
	networkConfigEndpoint   = "network/config"
	accountEndpoint         = "address/%s"
	sendTransactionEndpoint = "transaction/send"
)

// GetNetworkConfig retrieves the network configuration from the proxy
func GetNetworkConfig() (*NetworkConfig, error) {
	data, err := getHTTP(networkConfigEndpoint)
	if err != nil {
		return nil, err
	}
	response := &NetworkConfigResponse{}
	err = json.Unmarshal(data, response)

	return response.Data.Config, err
}

// GetAccount retrieves an account info from the network (nonce, balance)
func GetAccount(address string) (*Account, error) {
	if !IsValidBech32Address(address) {
		return nil, errInvalidAddress
	}
	endpoint := fmt.Sprintf(accountEndpoint, address)
	data, err := getHTTP(endpoint)
	if err != nil {
		return nil, err
	}
	response := &AccountResponse{}
	err = json.Unmarshal(data, response)

	return response.Data.Account, err
}

// SendTransaction broadcasts a transaction to the network and returns the txhash if successful
func SendTransaction(tx *Transaction) (string, error) {
	jsonTx, err := json.Marshal(tx)
	if err != nil {
		return "", err
	}
	data, err := postHTTP(sendTransactionEndpoint, jsonTx)
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

func getHTTP(endpoint string) ([]byte, error) {
	url := fmt.Sprintf("%s/%s", proxyURL, endpoint)
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

func postHTTP(endpoint string, data []byte) ([]byte, error) {
	url := fmt.Sprintf("%s/%s", proxyURL, endpoint)
	response, err := http.Post(url, "", strings.NewReader(string(data)))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = response.Body.Close()
	}()

	return ioutil.ReadAll(response.Body)
}
