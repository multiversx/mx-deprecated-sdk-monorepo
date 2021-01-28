# elrond-sdk

[![Build Status](https://travis-ci.com/ElrondNetwork/elrond-sdk.svg?branch=master)](https://travis-ci.com/ElrondNetwork/elrond-sdk)

This is a monorepo containing the following:

| Component   |      Type      |  Documentation | API | Changelog | CLI | Distribution
|----------|:-------------:|:-------------:|:-------------:|:-------------:|:-------------:|:-------------:|
| erdpy |  CLI and Python SDK | [docs.elrond.com](https://docs.elrond.com/tools/erdpy) | Sphinx (TBD) | [CHANGELOG](erdpy/CHANGELOG.md) | [CLI](erdpy/CLI.md) | [erdpy-up](https://docs.elrond.com/tools/erdpy/installing-erdpy#install-using-erdpy-up) and [PyPi](https://pypi.org/project/erdpy/#history)
| erdgo | Go SDK | [pkg.go.dev](https://pkg.go.dev/github.com/ElrondNetwork/elrond-sdk/erdgo) | N / A | [CHANGELOG](erdgo/CHANGELOG.md) | N / A  | `go.mod` (Github)
| erdjava | Java SDK | [JavaDoc](https://elrondnetwork.github.io/elrond-sdk-docs/erdjava) | N / A | [CHANGELOG](erdjava/CHANGELOG.md) | [CLI](erdjava/README.md)  | Source code (Github)
| erdjs |    TypeScript SDK   | TBD | [TypeDoc](https://elrondnetwork.github.io/elrond-sdk/erdjs/api/index.html) | [CHANGELOG](erdjs/CHANGELOG.md) | N / A | [npm](https://www.npmjs.com/package/@elrondnetwork/erdjs)
| erdtestjs |    TypeScript SDK   |  TBD | TypeDoc (TBD) | TBD | N / A | [npm](https://www.npmjs.com/package/@elrondnetwork/erdtestjs)
| erdwalletjs-cli | NodeJS CLI | TBD | N / A | [CHANGELOG](erdwalletjs-cli/CHANGELOG.md) | [CLI](erdwalletjs-cli/README.md)  | [npm](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli)

For developing Smart Contracts, [our tutorials](https://docs.elrond.com/docs/developers/tutorials/crowdfunding-p1), plus [Elrond IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide) - which is a frontend for erdpy - should be a good start. 


## Developers

The [Elrond Team](https://elrond.com/team/).

## Community Contributions

Thanks and credits go to:

- [Elrond Developers Group on Telegram](https://t.me/ElrondDevelopers) for testing, reporting issues and having very good suggestions and feature requests.
-  **[@flyingbasalt](https://github.com/flyingbasalt)** for implementing [json2pem](https://github.com/flyingbasalt/erdkeys/blob/master/erdkeys/json2pem.py). For more details, go to [erdkeys](https://github.com/flyingbasalt/erdkeys).

## Contribute

One can contribute by creating *pull requests*, or by opening *issues* for discovered bugs or desired features.

## How to publish an update

### erdpy

*Note: this flow will be improved in the near future.*

 - Create a new branch on top of `development`: `git checkout -b release-erdpy-v... development`
 - Bump version in `setup.py` and `erdpy/_version.py`.
 - Update `erdpy/CHANGELOG.md`.
 - Make a commit such as `Bump version: erdpy v...`.
 - Open a PR and get reviewers.
 - Once the PR is merged into `development`, trigger the action `Publish erdpy` from the Github Actions dashboard. This will publish the package on PyPi.

### erdjs

 - TBD
