clean:
	rm -rf ./dist

build: clean
	python3 setup.py sdist

publish: build
	twine upload dist/*

test-short:
	python3 -m unittest -v erdpy.tests.test_wallet
	python3 -m unittest -v erdpy.tests.test_accounts
	python3 -m unittest -v erdpy.tests.test_contracts

test-all:
	python3 -m unittest discover -s erdpy/tests

arwendebug:
	# When referencing a non-released version, add the commit hash, like this: arwen-wasm-vm/cmd/arwendebug@...
	# When referencing a released version, use the actual version instead: arwen-wasm-vm/cmd/arwendebug v0.3.14
	GO111MODULE=on GOPATH=$(shell pwd)/distribution/go go get github.com/ElrondNetwork/arwen-wasm-vm/cmd/arwendebug@a0e1bf5da9f57ffbc3596bc9631b0f18e7c34832
	stat ./distribution/go/bin/arwendebug

test-cli:
	python3 -m erdpy.cli get-num-shards --proxy="https://wallet-api.elrond.com"
	python3 -m erdpy.cli get-gas-price --proxy="https://wallet-api.elrond.com"
	python3 -m erdpy.cli get-chain-id --proxy="https://wallet-api.elrond.com"
	python3 -m erdpy.cli get-last-block-nonce --shard-id="1" --proxy="https://wallet-api.elrond.com"

	python3 -m erdpy.cli get-account --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://wallet-api.elrond.com"
	python3 -m erdpy.cli get-account --nonce --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://wallet-api.elrond.com"
	python3 -m erdpy.cli get-account --balance --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://wallet-api.elrond.com"

test-cli-contracts:
	python3 -m erdpy.cli templates --json
	python3 -m erdpy.cli new --template ultimate-answer --directory ./test-examples myanswer
	python3 -m erdpy.cli new --template adder --directory ./test-examples myadder

	python3 -m erdpy.cli build ./test-examples/myanswer
	python3 -m erdpy.cli build ./test-examples/myadder
