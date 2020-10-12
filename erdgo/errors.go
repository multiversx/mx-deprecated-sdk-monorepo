package erdgo

import "errors"

var (
	errInvalidPubkey  error = errors.New("Invalid pubkey")
	errInvalidAddress error = errors.New("Invalid address")
)
