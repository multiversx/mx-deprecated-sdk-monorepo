clean:
	rm -rf ./dist

build-erdpy: clean
	python3 setup.py sdist

publish-erdpy: build-erdpy
	twine upload dist/*

publish-erdwalletjs-cli-beta:
	cd ./erdwalletjs-cli && npm publish --tag=beta --access=public

publish-erdwalletjs-cli:
	cd ./erdwalletjs-cli && npm publish --access=public

publish-erdjs-beta:
	cd ./erdjs && npm publish --tag=beta --access=public

publish-erdjs:
	cd ./erdjs && npm publish --access=public

publish-erdtestjs-beta:
	cd ./erdtestjs && npm publish --tag=beta --access=public

publish-erdtestjs:
	cd ./erdtestjs && npm publish --access=public

test-erdpy:
	#python3 -m unittest discover -s erdpy/tests
	pytest ./erdpy/tests/test_testnet.py -s

arwendebug:
	# When referencing a non-released version, add the commit hash, like this: arwen-wasm-vm/cmd/arwendebug@...
	# When referencing a released version, use the actual version instead: arwen-wasm-vm/cmd/arwendebug v0.3.14
	GO111MODULE=on GOPATH=$(shell pwd)/distribution/go go get github.com/ElrondNetwork/arwen-wasm-vm/cmd/arwendebug@a0e1bf5da9f57ffbc3596bc9631b0f18e7c34832
	stat ./distribution/go/bin/arwendebug

test-cli: test-cli-accounts, test-cli-network
	python3 -m erdpy.cli cost gas-price --proxy=https://testnet-api.elrond.com
	python3 -m erdpy.cli cost transaction move-balance --data="foobar" --proxy="https://testnet-api.elrond.com"

test-cli-accounts:
	python3 -m erdpy.cli account get --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://testnet-api.elrond.com"
	python3 -m erdpy.cli account get --nonce --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://testnet-api.elrond.com"
	python3 -m erdpy.cli account get --balance --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://testnet-api.elrond.com"
	python3 -m erdpy.cli account get-transactions --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://testnet-api.elrond.com"

test-cli-network:
	#python3 -m erdpy.cli network num-shards --proxy="https://testnet-api.elrond.com"
	#python3 -m erdpy.cli network chain-id --proxy="https://testnet-api.elrond.com"
	#python3 -m erdpy.cli network last-block-nonce --shard-id="1" --proxy="https://testnet-api.elrond.com"
	python3 -m erdpy.cli network meta-nonce --proxy="https://testnet-api.elrond.com"
	python3 -m erdpy.cli network meta-block --proxy="https://testnet-api.elrond.com" --nonce=1
	#python3 -m erdpy.cli network meta-nonce --proxy="http://localhost:8001"
	#python3 -m erdpy.cli network meta-block --proxy="http://localhost:8001" --nonce=1

test-cli-blockatlas:
	python3 -m erdpy.cli blockatlas --url="http://localhost:8420" --coin="elrond" current-block-number
	python3 -m erdpy.cli blockatlas --url="http://localhost:8420" --coin="elrond" block-by-number --number=42
	python3 -m erdpy.cli blockatlas --url="http://localhost:8420" --coin="elrond" transactions --address="alice" 

test-cli-dispatcher:
	python3 -m erdpy.cli dispatcher enqueue --value="100" --receiver="erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r" --data="foo" --gas-price=200000000000 --gas-limit=50000000
	python3 -m erdpy.cli dispatcher enqueue --value="200" --receiver="erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r" --data="foo" --gas-price=200000000000 --gas-limit=50000000
	python3 -m erdpy.cli dispatcher enqueue --value="300" --receiver="erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r" --data="foo" --gas-price=200000000000 --gas-limit=50000000
	python3 -m erdpy.cli --verbose dispatcher dispatch --proxy="https://testnet-api.elrond.com" --pem="./examples/keys/alice.pem"
	#python3 -m erdpy.cli --verbose dispatcher dispatch-continuously --interval=1 --proxy="https://testnet-api.elrond.com" --pem="./examples/keys/alice.pem"

test-deployment:
	python3 -m examples.mycounter_testnet --proxy=https://testnet-api.elrond.com --pem=./examples/keys/alice.pem

list-s3:
	aws s3 ls s3://ide.elrond.com --recursive --human-readable --summarize
