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

	python3 -m erdpy.cli templates --json

test-cli-external-contracts:
ifndef SANDBOX
	$(error SANDBOX variable is undefined)
endif
	rm -rf ${SANDBOX}/myanswer
	rm -rf ${SANDBOX}/myadder
	rm -rf ${SANDBOX}/sc-busd-rs

	# Ultimate answer (C)
	python3 -m erdpy.cli new --template ultimate-answer --directory ${SANDBOX} myanswer
	python3 -m erdpy.cli build ${SANDBOX}/myanswer

	# Adder (rust)
	python3 -m erdpy.cli new --template adder --directory ${SANDBOX} myadder
	python3 -m erdpy.cli build ${SANDBOX}/myadder
	python3 -m erdpy.cli test --directory="test" ${SANDBOX}/myadder

	# BUSD (rust)
	git clone --depth=1 --branch=master https://github.com/ElrondNetwork/sc-busd-rs.git ${SANDBOX}/sc-busd-rs
	rm -rf ${SANDBOX}/sc-busd-rs/.git
	python3 -m erdpy.cli build ${SANDBOX}/sc-busd-rs
	python3 -m erdpy.cli test --directory="tests" ${SANDBOX}/sc-busd-rs

test-deployment:
	python3 -m examples.mycounter_testnet --proxy=https://wallet-api.elrond.com --pem=./examples/keys/alice.pem