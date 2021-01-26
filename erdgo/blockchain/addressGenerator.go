package blockchain

import (
	"bytes"

	elrondCore "github.com/ElrondNetwork/elrond-go/core"
	"github.com/ElrondNetwork/elrond-go/core/check"
	"github.com/ElrondNetwork/elrond-go/data/typeConverters/uint64ByteSlice"
	"github.com/ElrondNetwork/elrond-go/hashing"
	"github.com/ElrondNetwork/elrond-go/hashing/keccak"
	"github.com/ElrondNetwork/elrond-go/marshal"
	"github.com/ElrondNetwork/elrond-go/process"
	"github.com/ElrondNetwork/elrond-go/process/factory"
	"github.com/ElrondNetwork/elrond-go/process/smartContract/builtInFunctions"
	"github.com/ElrondNetwork/elrond-go/process/smartContract/hooks"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/core"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/disabled"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/storage"
)

const accountStartNonce = uint64(0)

var initialDNSAddress = bytes.Repeat([]byte{1}, 32)

// addressGenerator is used to generate some addresses based on elrond-go logic
type addressGenerator struct {
	coordinator    *shardCoordinator
	blockChainHook process.BlockChainHookHandler
	hasher         hashing.Hasher
}

// NewAddressGenerator
func NewAddressGenerator(coordinator *shardCoordinator) (*addressGenerator, error) {
	if check.IfNil(coordinator) {
		return nil, ErrNilShardCoordinator
	}

	builtInFuncs := builtInFunctions.NewBuiltInFunctionContainer()
	var argsHook = hooks.ArgBlockChainHook{
		Accounts:           &disabled.Accounts{},
		PubkeyConv:         core.AddressPublicKeyConverter,
		StorageService:     &disabled.StorageService{},
		BlockChain:         &disabled.Blockchain{},
		ShardCoordinator:   &disabled.ElrondShardCoordinator{},
		Marshalizer:        &marshal.JsonMarshalizer{},
		Uint64Converter:    uint64ByteSlice.NewBigEndianConverter(),
		BuiltInFunctions:   builtInFuncs,
		DataPool:           &disabled.DataPool{},
		CompiledSCPool:     storage.NewMapCacher(),
		NilCompiledSCStore: true,
	}
	blockchainHook, err := hooks.NewBlockChainHookImpl(argsHook)
	if err != nil {
		return nil, err
	}

	return &addressGenerator{
		coordinator:    coordinator,
		blockChainHook: blockchainHook,
		hasher:         keccak.Keccak{},
	}, nil
}

// CompatibleDNSAddress will return the compatible DNS address providing the shard ID
func (ag *addressGenerator) CompatibleDNSAddress(shardId byte) (addressHandler, error) {
	addressLen := len(initialDNSAddress)
	shardInBytes := []byte{0, shardId}

	newDNSPk := string(initialDNSAddress[:(addressLen-elrondCore.ShardIdentiferLen)]) + string(shardInBytes)
	newDNSAddress, err := ag.blockChainHook.NewAddress([]byte(newDNSPk), accountStartNonce, factory.ArwenVirtualMachine)
	if err != nil {
		return nil, err
	}

	return data.NewAddressFromBytes(newDNSAddress), err
}

// CompatibleDNSAddress will return the compatible DNS address providing the username
func (ag *addressGenerator) CompatibleDNSAddressFromUsername(username string) (addressHandler, error) {
	hash := ag.hasher.Compute(username)
	lastByte := hash[len(hash)-1]
	return ag.CompatibleDNSAddress(lastByte)
}
