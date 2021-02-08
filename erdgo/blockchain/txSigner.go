package blockchain

import (
	"github.com/ElrondNetwork/elrond-go/crypto"
	"github.com/ElrondNetwork/elrond-go/crypto/signing"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/ed25519"
	"github.com/ElrondNetwork/elrond-go/crypto/signing/ed25519/singlesig"
)

var suite = ed25519.NewEd25519()
var singleSigner = &singlesig.Ed25519Signer{}

type txSigner struct {
	keyGen crypto.KeyGenerator
}

// NewTxSigner contains the primitives used to correctly sign a transaction
func NewTxSigner() *txSigner {
	return &txSigner{
		keyGen: signing.NewKeyGenerator(suite),
	}
}

// SignMessage will generate the signature providing the private key bytes and the message bytes (usually the serialized
// form of the transaction)
func (ts *txSigner) SignMessage(msg []byte, skBytes []byte) ([]byte, error) {
	sk, err := ts.keyGen.PrivateKeyFromByteArray(skBytes)
	if err != nil {
		return nil, err
	}

	return singleSigner.Sign(sk, msg)
}

// GeneratePkBytes will generate the public key bytes out of the provided private key bytes
func (ts *txSigner) GeneratePkBytes(skBytes []byte) ([]byte, error) {
	sk, err := ts.keyGen.PrivateKeyFromByteArray(skBytes)
	if err != nil {
		return nil, err
	}

	pk := sk.GeneratePublic()

	return pk.ToByteArray()
}

// IsInterfaceNil returns true if there is no value under the interface
func (ts *txSigner) IsInterfaceNil() bool {
	return ts == nil
}
