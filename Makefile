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

arwendebug:
	# When referencing a non-released version, add the commit hash, like this: arwen-wasm-vm/cmd/arwendebug@...
	# When referencing a released version, use the actual version instead: arwen-wasm-vm/cmd/arwendebug v0.3.14
	GO111MODULE=on GOPATH=$(shell pwd)/distribution/go go get github.com/ElrondNetwork/arwen-wasm-vm/cmd/arwendebug@a0e1bf5da9f57ffbc3596bc9631b0f18e7c34832
	stat ./distribution/go/bin/arwendebug

list-s3:
	aws s3 ls s3://ide.elrond.com --recursive --human-readable --summarize

linguist:
	github-linguist --breakdown
