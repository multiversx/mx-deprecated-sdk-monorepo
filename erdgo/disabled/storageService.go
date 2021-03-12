package disabled

import (
	"github.com/ElrondNetwork/elrond-go/dataRetriever"
	"github.com/ElrondNetwork/elrond-go/storage"
)

// StorageService is a disabled implementation of the StorageService interface
type StorageService struct {
}

// GetStorer returns nil
func (ss *StorageService) GetStorer(_ dataRetriever.UnitType) storage.Storer {
	return nil
}

// AddStorer does nothing
func (ss *StorageService) AddStorer(_ dataRetriever.UnitType, _ storage.Storer) {
}

// Has returns nil
func (ss *StorageService) Has(_ dataRetriever.UnitType, _ []byte) error {
	return nil
}

// Get returns nil byte slice and nil error
func (ss *StorageService) Get(_ dataRetriever.UnitType, _ []byte) ([]byte, error) {
	return nil, nil
}

// Put returns nil
func (ss *StorageService) Put(_ dataRetriever.UnitType, _ []byte, _ []byte) error {
	return nil
}

// SetEpochForPutOperation does nothing
func (ss *StorageService) SetEpochForPutOperation(_ uint32) {
}

// GetAll returns nil map and nil error
func (ss *StorageService) GetAll(_ dataRetriever.UnitType, _ [][]byte) (map[string][]byte, error) {
	return nil, nil
}

// Destroy returns nil
func (ss *StorageService) Destroy() error {
	return nil
}

// CloseAll returns nil
func (ss *StorageService) CloseAll() error {
	return nil
}

// IsInterfaceNil returns true if there is no value under the interface
func (ss *StorageService) IsInterfaceNil() bool {
	return ss == nil
}
