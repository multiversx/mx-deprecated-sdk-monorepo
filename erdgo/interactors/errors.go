package interactors

import "errors"

// ErrNilProxy signals that a nil proxy was provided
var ErrNilProxy = errors.New("nil proxy")

// ErrNilTxSigner signals that a nil transaction signer was provided
var ErrNilTxSigner = errors.New("nil transaction signer")
