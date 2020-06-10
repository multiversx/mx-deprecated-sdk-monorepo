# erdpy

[![Build Status](https://travis-ci.com/ElrondNetwork/erdpy.svg?branch=master)](https://travis-ci.com/ElrondNetwork/erdpy)

**erdpy** overview and **installation steps** are on [docs.elrond.com](https://docs.elrond.com/tools/erdpy).

**Development is in progress. See [CHANGELOG](CHANGELOG.md).**

For tutorials, go to [wiki](https://github.com/ElrondNetwork/erdpy/wiki). For Python SDK examples, see [examples](examples).

## Command-line interface

### List project templates

Display the list of project templates (smart contracts templates):

```
$ erdpy templates
$ erdpy templates --json
```

These templates are downloaded from different sources, as configured in [templates_config.py](erdpy/projects/templates_config.py) and are written in **rust**, **C** or **Solidity**.

### Create new project

The following command creates a sample project called `hello` based on the template `ultimate-answer` (written in **C**):

```
$ erdpy new --template ultimate-answer --directory ./examples hello
$ erdpy new --template adder --directory ./examples myadder
```

### Build a project

In order to build a project you only have to specify its directory. Let's build the projects under `/example`: 

```
erdpy build ./examples/hello
erdpy build ./examples/myadder
```

The first one is written in **C**, while the second in **rust**. As you can see, the commands are similar.

### Run smart contract unit tests

In order to run JSON unit tests, add the unit tests in the project of the smart contract, in a folder named `test`. Then run the following command:

```
erdpy --verbose test ./examples/hello --wildcard="*"
```

### Deploy contract on testnet

Deploy a smart contract on the testnet (make sure the contract is built in advance):

```
erdpy --verbose deploy ./examples/contracts/hello --pem="./examples/keys/alice.pem" --proxy="https://api.elrond.com"
```

### Query contract values on testnet

Inspect values stored in the smart contract by performing a call to a pure, getter function:

```
erdpy --verbose query erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy --function="getUltimateAnswer" --proxy="https://api.elrond.com"
```

### Call contract functions on testnet

Call a function of an existing smart contract:

```
erdpy --verbose call erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy --pem="./examples/keys/alice.pem" --function="increment" --proxy="https://api.elrond.com"
```

### Issue regular transactions against the testnet

Prepare, then send transactions:

```
erdpy --verbose tx-prepare ./myplayground --tag="foobar" --pem="./examples/keys/alice.pem" --nonce=42 --receiver=erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr --value=100000

erdpy --verbose tx-send ./myplayground/tx-foobar.json --proxy=https://api.elrond.com

erdpy --verbose tx-prepare-and-send --pem="./examples/keys/alice.pem" --receiver=erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr --value=100000 --proxy=https://api.elrond.com

```

### Validators features

Features: Stake, UnStake, UnBound, UnJail, ChangeRewardAddress

```
erdpy --verbose stake-prepare ./myplayground --tag="foobar" --nonce=100 --pem="./examples/keys/alice.pem" --number-of-nodes=1 --nodes-public-keys="blsKey1" --value="2500000000000000000000000" --proxy=https://api.elrond.com --reward-address="bech32address--is-optional"
erdpy --verbose stake --pem="./examples/keys/alice.pem" --number-of-nodes=1 --nodes-public-keys="blsKey1" --value="2500000000000000000000000" --proxy=https://api.elrond.com --reward-address="bech32address--is-optional" --gas-limit=5000000 (optional if use --estimate-gas)  --estimate-gas (optional)
erdpy --verbose unstake --pem="./examples/keys/alice.pem" --nodes-public-keys="blsKey1" --proxy=https://api.elrond.com --gas-limit=5000000 (optional if use --estimate-gas)  --estimate-gas (optional)
erdpy --verbose unbond --pem="./examples/keys/alice.pem" --nodes-public-keys="blsKey1" --proxy=https://api.elrond.com --gas-limit=5000000 (optional if use --estimate-gas)  --estimate-gas (optional)
erdpy --verbose unjail --pem="./examples/keys/alice.pem" --value=2500000000000000000000 --nodes-public-keys="blsKey1" --proxy=https://api.elrond.com --gas-limit=5000000 (optional if use --estimate-gas)  --estimate-gas (optional)
erdpy --verbose change-reward-address --pem="./examples/keys/alice.pem" --reward-address="newbech32address" --proxy=https://api.elrond.com --gas-limit=5000000 (optional if use --estimate-gas)  --estimate-gas (optional)
erdpy --verbose claim --pem="./examples/keys/alice.pem" --proxy=https://api.elrond.com --gas-limit=5000000 (optional if use --estimate-gas)  --estimate-gas (optional)
```

### Miscellaneous features

Get information such as the number of shards, the gas price, the chain ID and so on:

```
erdpy network num-shards --proxy="https://api.elrond.com"
erdpy network chain-id --proxy="https://api.elrond.com"
erdpy network last-block-nonce --shard-id="1" --proxy="https://api.elrond.com"
```

Get details about a specific account (address on the blockchain):

```
erdpy account get --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://api.elrond.com"
erdpy account get --nonce --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://api.elrond.com"
erdpy account get --balance --address="erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr" --proxy="https://api.elrond.com"
```

Get estimated costs for transactions, in gas units. Note that there are 3 types of transactions:

 - move-balance
 - sc-deploy
 - sc-call


```
erdpy cost gas-price --proxy="https://api.elrond.com"
erdpy cost transaction move-balance --data="foobar" --proxy="https://api.elrond.com"
erdpy cost transaction sc-deploy --sc-path="./examples/hello" --proxy="https://api.elrond.com"
erdpy cost transaction sc-call --sc-address="erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy" --function="increment" --proxy="https://api.elrond.com"
```

### Wallet features

```
erdpy wallet generate ./myaccount.pem
erdpy wallet generate ./myaccount.pem --mnemonic="foo bar ..."
erdpy wallet bech32 --encode 000000000000000005006e4f90488e27342f9a46e1809452c85ee7186566bd5e
erdpy wallet bech32 --decode erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy
```


## Contribute

One can contribute by creating *pull requests*, or by opening *issues* for discovered bugs or desired features.
