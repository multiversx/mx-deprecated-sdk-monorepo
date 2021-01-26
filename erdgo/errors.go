package erdgo

import "errors"

var (
	errInvalidPemFile    = errors.New("invalid .PEM file")
	errWrongPassword     = errors.New("wrong password")
	errWrongAccount      = errors.New("different account recovered")
	errTxVersionMismatch = errors.New("transaction version mismatch")
	errTxOptionsMismatch = errors.New("transaction options mismatch")
)
