package erdgo

import "errors"

var (
	errInvalidPubkey  = errors.New("invalid pubkey")
	errInvalidAddress = errors.New("invalid address")
	errInvalidPemFile = errors.New("invalid .PEM file")
	errInvalidBalance = errors.New("invalid balance")
	errWrongPassword  = errors.New("wrong password")
	errWrongAccount   = errors.New("different account recovered")
)
