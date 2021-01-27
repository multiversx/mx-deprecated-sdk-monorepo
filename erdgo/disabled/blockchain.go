package disabled

import (
	"github.com/ElrondNetwork/elrond-go/data"
)

// Blockchain is a disabled implementation of the ChainHandler interface
type Blockchain struct {
}

// GetGenesisHeader returns nil
func (b *Blockchain) GetGenesisHeader() data.HeaderHandler {
	return nil
}

// SetGenesisHeader returns nil
func (b *Blockchain) SetGenesisHeader(_ data.HeaderHandler) error {
	return nil
}

// GetGenesisHeaderHash returns nil
func (b *Blockchain) GetGenesisHeaderHash() []byte {
	return nil
}

// SetGenesisHeaderHash does nothing
func (b *Blockchain) SetGenesisHeaderHash(_ []byte) {
}

// GetCurrentBlockHeader returns nil
func (b *Blockchain) GetCurrentBlockHeader() data.HeaderHandler {
	return nil
}

// SetCurrentBlockHeader returns nil
func (b *Blockchain) SetCurrentBlockHeader(_ data.HeaderHandler) error {
	return nil
}

// GetCurrentBlockHeaderHash returns nil
func (b *Blockchain) GetCurrentBlockHeaderHash() []byte {
	return nil
}

// SetCurrentBlockHeaderHash does nothing
func (b *Blockchain) SetCurrentBlockHeaderHash(_ []byte) {
}

// IsInterfaceNil returns true if there is no value under the interface
func (b *Blockchain) IsInterfaceNil() bool {
	return b == nil
}

// CreateNewHeader returns nil
func (b *Blockchain) CreateNewHeader() data.HeaderHandler {
	return nil
}
