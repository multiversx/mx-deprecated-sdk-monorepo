# erdpy

**Development is in progress. See [CHANGELOG](CHANGELOG.md).**

**For tutorials, go to [wiki](https://github.com/ElrondNetwork/erdpy/wiki).**

**For Python SDK examples, see [examples](examples).**

Elrond - Command Line Tools and Python SDK for interacting with Smart Contracts.

One can use **erdpy** to build, test and debug Elrond smart contracts, deploy them on the testnet and interact with contracts by issuing function calls (transactions).

**Erdpy** also acts as a wrapper over the Elrond REST API.


## Installation

### Ubuntu

Make sure that you have installed **Python3** (version **3.6** or later) and **Pip3** in advance:

```
python3 --version
pip3 --version
```

Then issue the following command:

```
pip3 install --user --upgrade --no-cache-dir erdpy
```

Test installation as follows:

```
pip3 show erdpy
erdpy --version
```

If `erdpy` command is not found (not registered correctly), issue the command:

```
source ~/.profile
```

### MacOS

Make sure that you have installed **Python3** (version **3.6** or later) and **Pip3** in advance:

```
python3 --version
pip3 --version
```

Add this line to `~/.bash_profile` or `~/.zshrc` (if you’re using zsh) **before installing the package** (make sure to replace the placeholders below):

```
export PATH=/Users/YOUR_USERNAME/Library/Python/YOUR_PYTHON_VERSION/bin:${PATH}
```

For example:

```
export PATH=/Users/elrond/Library/Python/3.7/bin:${PATH}
```

Then issue the following command:

```
pip3 install --user --upgrade --no-cache-dir erdpy
```

Test installation as follows:

```
pip3 show erdpy
erdpy --version
```

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
erdpy --verbose deploy ./examples/contracts/hello --pem="./examples/keys/alice.pem" --proxy="https://wallet-api.elrond.com"
```

### Query contract values on testnet

Inspect values stored in the smart contract by performing a call to a pure, getter function:

```
erdpy --verbose query 00000000000000000500de287dcbcaa9b5867c7c83b489ab1a1a40ea4f39b39d --function="getUltimateAnswer" --proxy="https://wallet-api.elrond.com"
```

### Call contract functions on testnet

Call a function of an existing smart contract:

```
erdpy --verbose call 000000000000000005000480f273914b6ceeaed2653a1a3d59f9656d6530bd5e --pem="./examples/keys/alice.pem" --function="increment" --proxy="https://wallet-api.elrond.com"
```

### Issue regular transactions against the testnet

Prepare, then send transactions:

```
erdpy --verbose tx-prepare ./myplayground --tag="foobar" --pem="./examples/keys/alice.pem" --nonce=42 --receiver=a967adb3d1574581a6f7ffe0cd6600fb488686704fcff944c88efc7c90b3b13b --value=100000
erdpy --verbose tx-send ./myplayground/tx-foobar.json --proxy=https://wallet-api.elrond.com
```

### Other features

Get information such as the number of shards, the gas price, the chain ID and so on:

```
erdpy get-num-shards --proxy="https://wallet-api.elrond.com"
erdpy get-gas-price --proxy="https://wallet-api.elrond.com"
erdpy get-chain-id --proxy="https://wallet-api.elrond.com"
erdpy get-last-block-nonce --shard-id="1" --proxy="https://wallet-api.elrond.com"
```

Get details about a specific account (address on the blockchain):

```
erdpy get-account --address="93ee6143cdc10ce79f15b2a6c2ad38e9b6021c72a1779051f47154fd54cfbd5e" --proxy="https://wallet-api.elrond.com"
erdpy get-account --nonce --address="93ee6143cdc10ce79f15b2a6c2ad38e9b6021c72a1779051f47154fd54cfbd5e" --proxy="https://wallet-api.elrond.com"
erdpy get-account --balance --address="93ee6143cdc10ce79f15b2a6c2ad38e9b6021c72a1779051f47154fd54cfbd5e" --proxy="https://wallet-api.elrond.com"
```

Get estimated costs for transactions, in gas units. Note that there are 3 types of transactions:

 - move-balance
 - sc-deploy
 - sc-call


```
erdpy get-transaction-cost move-balance --data="foobar" --proxy="https://wallet-api.elrond.com"
erdpy get-transaction-cost sc-deploy --sc-path="./examples/hello" --proxy="https://wallet-api.elrond.com"
erdpy get-transaction-cost sc-call --sc-address="00000000000000000500de287dcbcaa9b5867c7c83b489ab1a1a40ea4f39b39d" --function="increment" --proxy="https://wallet-api.elrond.com"
```



## Contribute

One can contribute by creating *pull requests*, or by opening *issues* for discovered bugs or desired features.
