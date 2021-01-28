package disabled

// ElrondShardCoordinator is the disabled shard coordinator instance that satisfies the elrond.sharding.Coordinator interface
type ElrondShardCoordinator struct {
}

// NumberOfShards returns 0
func (esc *ElrondShardCoordinator) NumberOfShards() uint32 {
	return 0
}

// ComputeId returns 0
func (esc *ElrondShardCoordinator) ComputeId(_ []byte) uint32 {
	return 0
}

// SelfId returns 0
func (esc *ElrondShardCoordinator) SelfId() uint32 {
	return 0
}

// SameShard returns false
func (esc *ElrondShardCoordinator) SameShard(_, _ []byte) bool {
	return false
}

// CommunicationIdentifier returns empty string
func (esc *ElrondShardCoordinator) CommunicationIdentifier(_ uint32) string {
	return ""
}

// IsInterfaceNil returns true if there is no value under the interface
func (esc *ElrondShardCoordinator) IsInterfaceNil() bool {
	return esc == nil
}
