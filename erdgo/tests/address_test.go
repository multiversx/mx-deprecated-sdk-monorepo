package tests

import (
	"math/rand"
	"testing"

	"github.com/ElrondNetwork/elrond-sdk/erdgo"
	"github.com/stretchr/testify/assert"
)

func TestAddress_GetShard(t *testing.T) {
	t.Parallel()

	pubkey := make([]byte, 32)
	rand.Read(pubkey)

	numShardsWithoutMeta := uint32(2)

	pubkey[31] &= 0xFE
	addr0, errA0 := erdgo.PubkeyToBech32(pubkey)

	pubkey[31] |= 0x01
	addr1, errA1 := erdgo.PubkeyToBech32(pubkey)

	assert.Nil(t, errA0)
	assert.Nil(t, errA1)

	sh0, errS0 := erdgo.GetAddressShard(addr0, numShardsWithoutMeta)
	sh1, errS1 := erdgo.GetAddressShard(addr1, numShardsWithoutMeta)

	assert.Nil(t, errS0)
	assert.Nil(t, errS1)

	assert.Equal(t, sh0, uint32(0))
	assert.Equal(t, sh1, uint32(1))
}
