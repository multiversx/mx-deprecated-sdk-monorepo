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

	python3 -m erdpy.cli wallet generate ./myaccount.pem
	python3 -m erdpy.cli wallet bech32 --encode 000000000000000005006e4f90488e27342f9a46e1809452c85ee7186566bd5e
	python3 -m erdpy.cli wallet bech32 --decode erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy

	python3 -m erdpy.cli cost gas-price --proxy=https://wallet-api.elrond.com
	python3 -m erdpy.cli cost transaction move-balance --data="foobar" --proxy="https://wallet-api.elrond.com"

	python3 -m erdpy.cli --verbose unstake --pem="./examples/keys/alice.pem" --nodes-public-keys="blsKey1" --proxy=https://wallet-api.elrond.com
	python3 -m erdpy.cli --verbose unbond --pem="./examples/keys/alice.pem" --nodes-public-keys="blsKey1" --proxy=https://wallet-api.elrond.com
	python3 -m erdpy.cli --verbose unjail --pem="./examples/keys/alice.pem" --value=500000000000000000000 --nodes-public-keys="blsKey1" --proxy=https://wallet-api.elrond.com
	python3 -m erdpy.cli --verbose change-reward-address --pem="./examples/keys/alice.pem" --reward-address="newbech32address" --proxy=https://wallet-api.elrond.com


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