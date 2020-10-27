package erdgo

import "errors"

var (
	errInvalidPubkey  error = errors.New("invalid pubkey")
	errInvalidAddress error = errors.New("invalid address")
	errInvalidPemFile error = errors.New("invalid .PEM file")
	errInvalidBalance error = errors.New("invalid balance")
)
