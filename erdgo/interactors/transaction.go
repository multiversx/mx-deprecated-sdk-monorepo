package interactors

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/ElrondNetwork/elrond-go/core/check"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/core"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

// ArgCreateTransaction will hold the transaction fields
type ArgCreateTransaction struct {
	Nonce     uint64
	Value     string
	RcvAddr   string
	SndAddr   string
	GasPrice  uint64
	GasLimit  uint64
	Data      []byte
	Signature string
	ChainID   string
	Version   uint32
	Options   uint32
}

type transactionInteractor struct {
	Proxy
	TxSigner
	mutTxAccumulator sync.RWMutex
	txAccumulator    []*data.Transaction
}

// NewTransactionInteractor will create an interactor that extends the proxy functionality with some transaction-oriented functionality
func NewTransactionInteractor(proxy Proxy, txSigner TxSigner) (*transactionInteractor, error) {
	if check.IfNil(proxy) {
		return nil, ErrNilProxy
	}
	if check.IfNil(txSigner) {
		return nil, ErrNilTxSigner
	}

	return &transactionInteractor{
		Proxy:    proxy,
		TxSigner: txSigner,
	}, nil
}

// AddTransaction will add the provided transaction in the transaction accumulator
func (ti *transactionInteractor) AddTransaction(tx *data.Transaction) {
	if tx == nil {
		return
	}

	ti.mutTxAccumulator.Lock()
	ti.txAccumulator = append(ti.txAccumulator, tx)
	ti.mutTxAccumulator.Unlock()
}

// ClearTxAccumulator will empty the transaction accumulator
func (ti *transactionInteractor) ClearTxAccumulator() {
	ti.mutTxAccumulator.Lock()
	ti.txAccumulator = make([]*data.Transaction, 0)
	ti.mutTxAccumulator.Unlock()
}

// GetAccumulatorContents will return the accumulator's content as a slice copy
func (ti *transactionInteractor) GetAccumulatorContents() []*data.Transaction {
	ti.mutTxAccumulator.RLock()
	result := make([]*data.Transaction, len(ti.txAccumulator))
	copy(result, ti.txAccumulator)
	ti.mutTxAccumulator.RUnlock()

	return result
}

// CreateTransaction assembles a transaction from the provided arguments
func (ti *transactionInteractor) CreateTransaction(arg ArgCreateTransaction) *data.Transaction {
	return &data.Transaction{
		Nonce:     arg.Nonce,
		Value:     arg.Value,
		RcvAddr:   arg.RcvAddr,
		SndAddr:   arg.SndAddr,
		GasPrice:  arg.GasPrice,
		GasLimit:  arg.GasLimit,
		Data:      arg.Data,
		Signature: arg.Signature,
		ChainID:   arg.ChainID,
		Version:   arg.Version,
		Options:   arg.Options,
	}
}

// ApplySignatureAndSender will apply the corresponding sender and compute the signature field upon the provided argument
func (ti *transactionInteractor) ApplySignatureAndSender(skBytes []byte, arg ArgCreateTransaction) (ArgCreateTransaction, error) {
	pkBytes, err := ti.TxSigner.GeneratePkBytes(skBytes)
	if err != nil {
		return ArgCreateTransaction{}, err
	}

	copyArg := arg
	copyArg.Signature = ""
	copyArg.SndAddr = core.AddressPublicKeyConverter.Encode(pkBytes)

	unsignedMessaged, err := ti.createUnsignedMessage(copyArg)
	if err != nil {
		return ArgCreateTransaction{}, err
	}

	signature, err := ti.TxSigner.SignMessage(unsignedMessaged, skBytes)
	if err != nil {
		return ArgCreateTransaction{}, err
	}

	copyArg.Signature = hex.EncodeToString(signature)

	return copyArg, nil
}

func (ti *transactionInteractor) createUnsignedMessage(arg ArgCreateTransaction) ([]byte, error) {
	tx := ti.CreateTransaction(arg)

	return json.Marshal(tx)
}

func (ti *transactionInteractor) SendTransactionsAsBunch(numberOfBunches int) ([]string, error) {

	bnchSize := len(ti.txAccumulator) / numberOfBunches
	var bunch []*data.Transaction
	var msg []string
	var err error
	txIndex := 0

	for bnchIndex := 0; bnchIndex < numberOfBunches; bnchIndex++ {
		fmt.Println("Bunch index: ", bnchIndex)

		for index := 0; index < bnchSize; index++ {
			bunch = append(bunch, ti.txAccumulator[txIndex])
			txIndex++
		}

		msg, err = ti.Proxy.SendTransactions(bunch)
		if err != nil {
			return nil, err
		}
		time.Sleep(10000 * time.Millisecond)
	}
	return msg, err
}
