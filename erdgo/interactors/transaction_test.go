package interactors

import (
	"encoding/hex"
	"fmt"
	"math/big"
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/interactors/mock"
	"github.com/stretchr/testify/assert"
)

func TestTransactionInteractor_ApplySignatureAndSenderWithRealTxSigner(t *testing.T) {
	t.Parallel()

	txSigner := blockchain.NewTxSigner()
	proxy := &mock.ProxyStub{}

	sk, err := hex.DecodeString("6ae10fed53a84029e53e35afdbe083688eea0917a09a9431951dd42fd4da14c40d248169f4dd7c90537f05be1c49772ddbf8f7948b507ed17fb23284cf218b7d")

	assert.Nil(t, err)

	ti, err := NewTransactionInteractor(proxy, txSigner)
	assert.Nil(t, err)
	assert.NotNil(t, ti)

	value := big.NewInt(0)
	value.SetString("999", 10)

	args := ArgCreateTransaction{
		0,
		value.String(),
		"erd1l20m7kzfht5rhdnd4zvqr82egk7m4nvv3zk06yw82zqmrt9kf0zsf9esqq",
		"",
		10,
		100000,
		[]byte(""),
		"",
		"integration test chain id",
		uint32(1),
		0,
	}

	args, err = ti.ApplySignatureAndSender(sk, args)
	tx := ti.CreateTransaction(args)

	assert.Equal(t, "erd1p5jgz605m47fq5mlqklpcjth9hdl3au53dg8a5tlkgegfnep3d7stdk09x", tx.SndAddr)
	assert.Equal(t, "80e1b5476c5ea9567614d9c364e1a7380b7990b53e7b6fd8431bf8536d174c8b3e73cc354b783a03e5ae0a53b128504a6bcf32c3b9bbc06f284afe1fac179e0d",
		tx.Signature)

}

func TestTransactionInteractor_SendTransactionsAsBunch_OneTransaction(t *testing.T) {
	t.Parallel()

	proxy := &mock.ProxyStub{
		SendTransactionsCalled: func(tx []*data.Transaction) ([]string, error) {
			var msgs []string
			for i := 0; i < len(tx); i++ {
				msgs = append(msgs, "SUCCESS")
			}
			return msgs, nil
		},
	}

	var signer TxSigner = &mock.TxSignerStub{}

	ti, err := NewTransactionInteractor(proxy, signer)
	assert.Nil(t, err, "Error on transaction interactor constructor")

	value := big.NewInt(0)
	value.SetString("999", 10)
	args := ArgCreateTransaction{
		0,
		value.String(),
		"erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
		"erd1l20m7kzfht5rhdnd4zvqr82egk7m4nvv3zk06yw82zqmrt9kf0zsf9esqq",
		10,
		100000,
		[]byte(""),
		"394c6f1375f6511dd281465fb9dd7caf013b6512a8f8ac278bbe2151cbded89da28bd539bc1c1c7884835742712c826900c092edb24ac02de9015f0f494f6c0a",
		"integration test chain id",
		uint32(1),
		0,
	}
	tx := ti.CreateTransaction(args)
	ti.AddTransaction(tx)

	msg, err := ti.SendTransactionsAsBunch(1)
	assert.Nil(t, err, "Error on sending bunches")
	fmt.Println("Message: ", msg)
	assert.NotNil(t, msg)

}

func TestTransactionInteractor_SendTransactionsAsBunch_MultipleTransactions(t *testing.T) {
	t.Parallel()

	proxy := &mock.ProxyStub{
		SendTransactionsCalled: func(tx []*data.Transaction) ([]string, error) {
			var msgs []string
			for i := 0; i < len(tx); i++ {
				msgs = append(msgs, "SUCCESS")
			}
			return msgs, nil
		},
	}

	var signer TxSigner = &mock.TxSignerStub{}

	ti, err := NewTransactionInteractor(proxy, signer)
	assert.Nil(t, err, "Error on transaction interactor constructor")

	value := big.NewInt(0)
	value.SetString("999", 10)
	nonce := uint64(0)
	for nonce < 10000 {
		args := ArgCreateTransaction{
			nonce,
			value.String(),
			"erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
			"erd1l20m7kzfht5rhdnd4zvqr82egk7m4nvv3zk06yw82zqmrt9kf0zsf9esqq",
			10,
			100000,
			[]byte(""),
			"394c6f1375f6511dd281465fb9dd7caf013b6512a8f8ac278bbe2151cbded89da28bd539bc1c1c7884835742712c826900c092edb24ac02de9015f0f494f6c0a",
			"integration test chain id",
			uint32(1),
			0,
		}
		tx := ti.CreateTransaction(args)
		ti.AddTransaction(tx)
		nonce++
	}

	msg, err := ti.SendTransactionsAsBunch(1000)
	assert.Nil(t, err, "Error on sending bunches")
	fmt.Println("Message: ", msg)
	assert.NotNil(t, msg)

}
