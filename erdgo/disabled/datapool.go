package disabled

import (
	"github.com/ElrondNetwork/elrond-go/dataRetriever"
	"github.com/ElrondNetwork/elrond-go/storage"
)

// DataPool is the disabled implementation of a PoolsHolder interface
type DataPool struct {
}

// Transactions returns nil
func (dp *DataPool) Transactions() dataRetriever.ShardedDataCacherNotifier {
	return nil
}

// UnsignedTransactions returns nil
func (dp *DataPool) UnsignedTransactions() dataRetriever.ShardedDataCacherNotifier {
	return nil
}

// RewardTransactions returns nil
func (dp *DataPool) RewardTransactions() dataRetriever.ShardedDataCacherNotifier {
	return nil
}

// Headers returns nil
func (dp *DataPool) Headers() dataRetriever.HeadersPool {
	return nil
}

// MiniBlocks returns nil
func (dp *DataPool) MiniBlocks() storage.Cacher {
	return nil
}

//PeerChangesBlocks returns nil
func (dp *DataPool) PeerChangesBlocks() storage.Cacher {
	return nil
}

// TrieNodes returns nil
func (dp *DataPool) TrieNodes() storage.Cacher {
	return nil
}

// SmartContracts returns nil
func (dp *DataPool) SmartContracts() storage.Cacher {
	return nil
}

// CurrentBlockTxs return nil
func (dp *DataPool) CurrentBlockTxs() dataRetriever.TransactionCacher {
	return nil
}

// IsInterfaceNil returns true if there is no value under the interface
func (dp *DataPool) IsInterfaceNil() bool {
	return dp == nil
}
