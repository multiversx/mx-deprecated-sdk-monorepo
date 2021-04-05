package data

import (
	"github.com/ElrondNetwork/elrond-go/data/vm"
)

// VmValuesResponseData follows the format of the data field in an API response for a VM values query
type VmValuesResponseData struct {
	Data *vm.VMOutputApi `json:"data"`
}

// ResponseVmValue defines a wrapper over string containing returned data in hex format
type ResponseVmValue struct {
	Data  VmValuesResponseData `json:"data"`
	Error string               `json:"error"`
	Code  string               `json:"code"`
}

// VmValueRequest defines the request struct for values available in a VM
type VmValueRequest struct {
	Address    string   `json:"scAddress"`
	FuncName   string   `json:"funcName"`
	CallerAddr string   `json:"caller"`
	CallValue  string   `json:"value"`
	Args       []string `json:"args"`
}
