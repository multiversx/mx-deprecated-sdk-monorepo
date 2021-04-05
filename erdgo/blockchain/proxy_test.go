package blockchain

import (
	"bytes"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

func TestElrondProxy_GetNetworkEconomics(t *testing.T) {
	t.Skip()

	ep := NewElrondProxy("https://gateway.elrond.com")

	networkEconomics, err := ep.GetNetworkEconomics()
	fmt.Println(err)
	fmt.Println(networkEconomics)
}

func TestElrondProxy_RequestTransactionCost(t *testing.T) {
	t.Skip()
	ep := NewElrondProxy("http://localhost:8079")

	tx := &data.Transaction{
		Nonce:   1,
		Value:   "50",
		RcvAddr: "erd1rh5ws22jxm9pe7dtvhfy6j3uttuupkepferdwtmslms5fydtrh5sx3xr8r",
		SndAddr: "erd1rh5ws22jxm9pe7dtvhfy6j3uttuupkepferdwtmslms5fydtrh5sx3xr8r",
		Data:    []byte("hello"),
		ChainID: "1",
		Version: 1,
		Options: 0,
	}
	txCost, err := ep.RequestTransactionCost(tx)
	fmt.Println(err)
	fmt.Println(txCost)
}

func TestElrondProxy_RequestTransactionCostSCCall(t *testing.T) {
	t.Skip()
	ep := NewElrondProxy("http://localhost:8079")

	tx := &data.Transaction{
		Nonce:   1,
		Value:   "250000000000000000000",
		RcvAddr: "erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt",
		SndAddr: "erd1rh5ws22jxm9pe7dtvhfy6j3uttuupkepferdwtmslms5fydtrh5sx3xr8r",
		Data:    []byte("stake"),
		ChainID: "1",
		Version: 1,
		Options: 0,
	}
	txCost, err := ep.RequestTransactionCost(tx)
	fmt.Println(err)
	fmt.Println(txCost)
}

func TestElrondProxy_GetTransactionInfoWithResults(t *testing.T) {
	t.Skip()

	ep := NewElrondProxy("http://localhost:8079")

	tx, err := ep.GetTransactionInfoWithResults("a40e5a6af4efe221608297a73459211756ab88b96896e6e331842807a138f343")
	txBytes, _ := json.Marshal(tx)

	var prettyJSON bytes.Buffer
	_ = json.Indent(&prettyJSON, txBytes, "", "\t")

	fmt.Println(prettyJSON.String())
	fmt.Println(err)
}
