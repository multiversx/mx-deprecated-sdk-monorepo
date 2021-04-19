package tests

import (
	"bytes"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/blockchain"
	"github.com/ElrondNetwork/elrond-sdk/erdgo/data"
	"github.com/stretchr/testify/assert"
	"io/ioutil"
	"net/http"
	"testing"
)

type mockHTTPClient struct {
	lastRequest *http.Request
}

func (m *mockHTTPClient) Do(req *http.Request) (*http.Response, error) {
	m.lastRequest = req
	return &http.Response{
		Body: ioutil.NopCloser(bytes.NewReader([]byte("account"))),
	}, nil
}

func TestGetAccount(t *testing.T) {
	t.Parallel()

	httpClient := &mockHTTPClient{}
	proxy := blockchain.NewElrondProxy("http://test.org", httpClient)

	address, err := data.NewAddressFromBech32String("erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts")
	if err != nil {
		assert.Error(t, err)
	}

	_, err = proxy.GetAccount(address)
	if err != nil {
		assert.Error(t, err)
	}

	expected := "http://test.org/address/erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts"

	assert.Equal(t, expected, httpClient.lastRequest.URL.String())
}
