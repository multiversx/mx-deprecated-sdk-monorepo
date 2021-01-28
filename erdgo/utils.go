package erdgo

import (
	"encoding/hex"
	"encoding/json"

	"github.com/ElrondNetwork/elrond-go/crypto/signing"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/ed25519"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/ed25519/singlesig"
	"github.com/ElrondNetwork/elrond-go/hashing/keccak"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
)

const (
	versionForTxHashSigning = 2
	optionsForTxHashSigning = 1
)

var hasherForTxHashSigning = keccak.Keccak{}

// SignTransaction signs a transaction with the provided private key
func SignTransaction(tx *data.Transaction, privateKey []byte) error {
	tx.Signature = ""
	txSingleSigner := &singlesig.Ed25519Signer{}
	suite := ed25519.NewEd25519()
	keyGen := signing.NewKeyGenerator(suite)
	txSignPrivKey, err := keyGen.PrivateKeyFromByteArray(privateKey)
	if err != nil {
		return err
	}
	bytes, err := json.Marshal(&tx)
	if err != nil {
		return err
	}
	signature, err := txSingleSigner.Sign(txSignPrivKey, bytes)
	if err != nil {
		return err
	}
	tx.Signature = hex.EncodeToString(signature)

	return nil
}

// SignTransactionHash signs a transaction with the provided private key
// Also known as "version 2" transactions, their signatures are computed upon the sha256 hash
// of the marshalized transaction instead of the plain marshalized transaction
func SignTransactionHash(tx *data.Transaction, privateKey []byte) error {
	tx.Signature = ""
	if tx.Version != versionForTxHashSigning {
		return errTxVersionMismatch
	}
	if tx.Options != optionsForTxHashSigning {
		return errTxOptionsMismatch
	}
	txSingleSigner := &singlesig.Ed25519Signer{}
	suite := ed25519.NewEd25519()
	keyGen := signing.NewKeyGenerator(suite)
	txSignPrivKey, err := keyGen.PrivateKeyFromByteArray(privateKey)
	if err != nil {
		return err
	}
	bytes, err := json.Marshal(&tx)
	if err != nil {
		return err
	}
	bytes = hasherForTxHashSigning.Compute(string(bytes))
	signature, err := txSingleSigner.Sign(txSignPrivKey, bytes)
	if err != nil {
		return err
	}
	tx.Signature = hex.EncodeToString(signature)

	return nil
}
