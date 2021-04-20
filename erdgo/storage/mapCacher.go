package storage

import (
	"bytes"
	"encoding/gob"
	"github.com/prometheus/common/log"
	"sync"
)

// mapCacher is the cacher implementation based on a map
type mapCacher struct {
	sync.RWMutex
	dataMap              map[string]interface{}
	mutAddedDataHandlers sync.RWMutex
	addedDataHandlers    []func(key []byte, val interface{})
}

// NewMapCacher creates a new map cacher implementation
func NewMapCacher() *mapCacher {
	return &mapCacher{
		dataMap:           make(map[string]interface{}),
		addedDataHandlers: make([]func(key []byte, val interface{}), 0),
	}
}

// Clear deletes any kind of data stored
func (mc *mapCacher) Clear() {
	mc.Lock()
	defer mc.Unlock()

	mc.dataMap = make(map[string]interface{})
}

// Put stores a new key-value pair
func (mc *mapCacher) Put(key []byte, value interface{}, _ int) (evicted bool) {
	mc.Lock()
	defer mc.Unlock()

	mc.dataMap[string(key)] = value
	mc.callAddedDataHandlers(key, value)

	return false
}

func (mc *mapCacher) callAddedDataHandlers(key []byte, val interface{}) {
	mc.mutAddedDataHandlers.RLock()
	for _, handler := range mc.addedDataHandlers {
		go handler(key, val)
	}
	mc.mutAddedDataHandlers.RUnlock()
}

// Get returns the value from a provided key
func (mc *mapCacher) Get(key []byte) (value interface{}, ok bool) {
	mc.RLock()
	defer mc.RUnlock()

	val, ok := mc.dataMap[string(key)]

	return val, ok
}

// Has returns true if the provided key exists in the map
func (mc *mapCacher) Has(key []byte) bool {
	mc.RLock()
	defer mc.RUnlock()

	_, ok := mc.dataMap[string(key)]

	return ok
}

// Peek will return the value stored at the provided key
func (mc *mapCacher) Peek(key []byte) (value interface{}, ok bool) {
	mc.RLock()
	defer mc.RUnlock()

	val, ok := mc.dataMap[string(key)]

	return val, ok
}

// HasOrAdd checks if a key is in the cache  without updating the
// recent-ness or deleting it for being stale,  and if not, adds the value.
// Returns whether found and whether an eviction occurred.
func (mc *mapCacher) HasOrAdd(key []byte, value interface{}, _ int) (has, added bool) {
	mc.Lock()
	defer mc.Unlock()

	_, has = mc.dataMap[string(key)]
	if has {
		return true, false
	}

	mc.dataMap[string(key)] = value
	mc.callAddedDataHandlers(key, value)
	return false, true
}

// Remove removes the provided key from the cache
func (mc *mapCacher) Remove(key []byte) {
	mc.Lock()
	defer mc.Unlock()

	delete(mc.dataMap, string(key))
}

// Keys returns a slice of the keys in the cache, from oldest to newest.
func (mc *mapCacher) Keys() [][]byte {
	keys := make([][]byte, len(mc.dataMap))
	idx := 0
	for k := range mc.dataMap {
		keys[idx] = []byte(k)
		idx++
	}

	return keys
}

// Len returns the number of items in the cache.
func (mc *mapCacher) Len() int {
	mc.RLock()
	defer mc.RUnlock()

	return len(mc.dataMap)
}

// SizeInBytesContained returns the size in bytes of all contained elements
func (mc *mapCacher) SizeInBytesContained() uint64 {
	mc.RLock()
	defer mc.RUnlock()

	total := 0
	b := new(bytes.Buffer)
	for _, v := range mc.dataMap {
		var err = gob.NewEncoder(b).Encode(v)
		if err != nil {
			log.Error(err.Error())
			total += 0
		} else {
			total += b.Len()
		}
	}

	return uint64(total)
}

// MaxSize returns the maximum number of items which can be stored in cache.
func (mc *mapCacher) MaxSize() int {
	return 10000
}

// RegisterHandler -
func (mc *mapCacher) RegisterHandler(handler func(key []byte, value interface{}), _ string) {
	if handler == nil {
		return
	}

	mc.mutAddedDataHandlers.Lock()
	mc.addedDataHandlers = append(mc.addedDataHandlers, handler)
	mc.mutAddedDataHandlers.Unlock()
}

// UnRegisterHandler -
func (mc *mapCacher) UnRegisterHandler(string) {
}

// IsInterfaceNil returns true if there is no value under the interface
func (mc *mapCacher) IsInterfaceNil() bool {
	return mc == nil
}
