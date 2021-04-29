package main

import (
	"fmt"

	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

func main() {
	ep := blockchain.NewElrondProxy("http://localhost:8079", nil)

	vmRequest := &data.VmValueRequest{
		Address:    "erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt",
		FuncName:   "version",
		CallerAddr: "erd1rh5ws22jxm9pe7dtvhfy6j3uttuupkepferdwtmslms5fydtrh5sx3xr8r",
		CallValue:  "",
		Args:       nil,
	}
	response, err := ep.ExecuteVMQuery(vmRequest)
	if err != nil {
		fmt.Printf("Error executing VMQuery: %s\n\r", err)
		return
	}

	contractVersion := string(response.Data.ReturnData[0])
	fmt.Printf("Contract version: %s\n", contractVersion)
}
