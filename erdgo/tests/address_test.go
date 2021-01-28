package tests

import (
	"crypto/rand"
	"fmt"
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAddress_GetShard(t *testing.T) {
	t.Parallel()

	pubkey := make([]byte, 32)
	_, _ = rand.Read(pubkey)

	numShardsWithoutMeta := uint32(2)
	shardCoordinator, _ := blockchain.NewShardCoordinator(numShardsWithoutMeta, 0)

	pubkey[31] &= 0xFE
	addr0 := data.NewAddressFromBytes(pubkey)

	pubkey[31] |= 0x01
	addr1 := data.NewAddressFromBytes(pubkey)

	sh0, err := shardCoordinator.ComputeShardId(addr0)
	assert.Nil(t, err)

	sh1, err := shardCoordinator.ComputeShardId(addr1)
	assert.Nil(t, err)

	assert.Equal(t, sh0, uint32(0))
	assert.Equal(t, sh1, uint32(1))
}

func TestGenerateSameDNSAddress(t *testing.T) {
	t.Parallel()

	coord, err := blockchain.NewShardCoordinator(3, 0)
	require.Nil(t, err)

	ag, err := blockchain.NewAddressGenerator(coord)
	require.Nil(t, err)

	newDNS, err := ag.CompatibleDNSAddressFromUsername("christopher.elrond")
	require.Nil(t, err)

	fmt.Printf("Compatibile DNS address is %s\n", newDNS.AddressAsBech32String())
	assert.Equal(t, "erd1qqqqqqqqqqqqqpgqa2re7lsvuxz2gcpnkdh7qp75teyqff8gqqes39p5ge", newDNS.AddressAsBech32String())
}
