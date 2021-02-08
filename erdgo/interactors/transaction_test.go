package interactors

import (
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
)

func TestTransactionInteractor_ApplySignatureAndSenderWithRealTxSigner(t *testing.T) {
	t.Parallel()

	txSigner := blockchain.NewTxSigner()

}
