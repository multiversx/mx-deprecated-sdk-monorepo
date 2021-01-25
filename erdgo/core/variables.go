package core

import "github.com/ElrondNetwork/elrond-go/core/pubkeyConverter"

// AddressPublicKeyConverter represents the default address public key converter
var AddressPublicKeyConverter, _ = pubkeyConverter.NewBech32PubkeyConverter(AddressLen)
