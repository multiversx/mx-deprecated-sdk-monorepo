package tests

import (
	"github.com/ElrondNetwork/elrond-sdk/erdgo/storage"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSizeInBytesContained(t *testing.T) {
	cacher := storage.NewMapCacher()
	cacher.Put([]byte("key"), "value", 0)

	assert.Equal(t, uint64(9), cacher.SizeInBytesContained())
}
