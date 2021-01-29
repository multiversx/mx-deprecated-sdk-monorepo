package disabled

import (
	"context"

	"github.com/ElrondNetwork/elrond-go/core"
	"github.com/ElrondNetwork/elrond-go/data"
	"github.com/ElrondNetwork/elrond-go/data/state"
)

// Accounts is a disabled implementation of the AccountAdapter interface
type Accounts struct {
}

// GetCode returns nil
func (a *Accounts) GetCode(_ []byte) []byte {
	return nil
}

// RecreateAllTries return a nil map and nil error
func (a *Accounts) RecreateAllTries(_ []byte, _ context.Context) (map[string]data.Trie, error) {
	return nil, nil
}

// LoadAccount returns a nil account and nil error
func (a *Accounts) LoadAccount(_ []byte) (state.AccountHandler, error) {
	return nil, nil
}

// SaveAccount returns nil
func (a *Accounts) SaveAccount(_ state.AccountHandler) error {
	return nil
}

// GetAllLeaves returns a nil channel and nil error
func (a *Accounts) GetAllLeaves(_ []byte, _ context.Context) (chan core.KeyValueHolder, error) {
	return nil, nil
}

// AddJournalEntry does nothing
func (a *Accounts) AddJournalEntry(_ state.JournalEntry) {
}

// Commit returns nil byte slice and nil
func (a *Accounts) Commit() ([]byte, error) {
	return nil, nil
}

// GetExistingAccount returns nil  account handler and nil error
func (a *Accounts) GetExistingAccount(_ []byte) (state.AccountHandler, error) {
	return nil, nil
}

// JournalLen returns 0
func (a *Accounts) JournalLen() int {
	return 0
}

// RemoveAccount returns nil
func (a *Accounts) RemoveAccount(_ []byte) error {
	return nil
}

// RevertToSnapshot returns nil
func (a *Accounts) RevertToSnapshot(_ int) error {
	return nil
}

// RootHash returns nil byte slice and nil error
func (a *Accounts) RootHash() ([]byte, error) {
	return nil, nil
}

// RecreateTrie returns nil
func (a *Accounts) RecreateTrie(_ []byte) error {
	return nil
}

// PruneTrie does nothing
func (a *Accounts) PruneTrie(_ []byte, _ data.TriePruningIdentifier) {
}

// CancelPrune does nothing
func (a *Accounts) CancelPrune(_ []byte, _ data.TriePruningIdentifier) {
}

// SnapshotState does nothing
func (a *Accounts) SnapshotState(_ []byte, _ context.Context) {
}

// SetStateCheckpoint does nothing
func (a *Accounts) SetStateCheckpoint(_ []byte, _ context.Context) {
}

// IsPruningEnabled returns false
func (a *Accounts) IsPruningEnabled() bool {
	return false
}

// GetNumCheckpoints returns 0
func (a *Accounts) GetNumCheckpoints() uint32 {
	return 0
}

// IsInterfaceNil returns true if there is no value under the interface
func (a *Accounts) IsInterfaceNil() bool {
	return a == nil
}
