# erdpy

**Development is in progress. See [CHANGELOG](CHANGELOG.md).**

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

Add this line to `~/.bash_profile` or `~/.zshrc` (if you’re using zsh) before installing the package (make sure to replace the placeholders):

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

In order to deploy a smart contract on the testnet, make sure it is already build and issue the following command:

```
erdpy --verbose deploy ./examples/hello --pem="./examples/keys/alice.pem" --proxy="https://wallet-api.elrond.com"
```

### Query contract values on testnet

In order to inspect values stored in the smart contract, issue a call to a pure, getter function like this:

```
erdpy --verbose query 00000000000000000500de287dcbcaa9b5867c7c83b489ab1a1a40ea4f39b39d --function="getUltimateAnswer" --proxy="https://wallet-api.elrond.com"
```

## Tutorial for a simple counter written in C

Create the project:

```
erdpy new --template="simple-counter" --directory="./examples" mycounter
```

Build the project:

```
erdpy --verbose build ./examples/myconter
```

Deploy the contract:

```
erdpy --verbose deploy ./examples/mycounter --pem="./examples/keys/alice.pem" --proxy="https://wallet-api.elrond.com"
```

Inspect the contract address in the output. Then use the address to call the `increment` function several times.

```
erdpy --verbose call 000000000000000005001d80d94d25a77b5a9a6295d260e3c0e4b53ee8cbb39d --function="increment" --caller="8eb27b2bcaedc6de11793cf0625a4f8d64bf7ac84753a0b6c5d6ceb2be7eb39d" --pem="./examples/keys/alice.pem" --proxy="https://wallet-api.elrond.com"
```

Upon running the `increment` function several times, let's query the counter variable.

```
erdpy --verbose query 000000000000000005001d80d94d25a77b5a9a6295d260e3c0e4b53ee8cbb39d --function="get" --proxy="https://wallet-api.elrond.com"
```

## Tutorial for a simple adder written in RUST

Create the project:

```
erdpy --verbose new --template="adder" --directory="./examples" myadder
```

Build the project:

```
erdpy --verbose build ./examples/myadder
```

Deploy the contract and set an initial value of `42`:

```
erdpy --verbose deploy ./examples/myadder --pem="./examples/keys/alice.pem" --proxy="https://wallet-api.elrond.com" --arguments 100
```

First, let's query the accumulator value, it should have the initial value:

```
erdpy --verbose query 000000000000000005001d80d94d25a77b5a9a6295d260e3c0e4b53ee8cbb39d --function="getSum" --proxy="https://wallet-api.elrond.com"
```

Now let's add a value:

```
erdpy --verbose run --pem="./examples/keys/alice.pem" --proxy="https://wallet-api.elrond.com" --function="add" --arguments 0x64
```

## Information about a testnet from proxy

General info
```
# will return how many shards are in testnet
erd get-num-shards --proxy="proxy-url"

# will return gas price (minimum gas price)
erd get-gas-price --proxy="proxy-url"

# will return chain id of the testnet
erd get-chain-id --proxy="proxy-url"

# will return last block nonce of a specific shard
erd get-last-block-nonce --shard-id="shard-id" --proxy="proxy-url
```


Account
```
# will return the account with given address
erd get-account --address="account-address-hex-encoded" --proxy="proxy-url"

# will return account balance with  given address
erd get-account --address="account-address-hex-encoded" --balance --proxy="proxy-url"

# will return account nonce with given address
erd get-account --address="account-address-hex-encoded" --nonce --proxy="proxy-url"
```

Transaction cost estimation

```
# transaction cost estimator will return how many gas units a transaction will consume
# there're 3 types of transactions: move-balance, sc-deploy and sc-call 

# will return how many gas units a move balance transaction will cost
erd get-transaction-cost move-balance --data="optional" --proxy="proxy-url"

# will return how many gas units a smart contract deploy will cost
erd get-transaction-cost sc-deploy --sc-path="path-smart-contract-location" --proxy="proxy-url" 

# will return how many gas unit a smart contract call will cost
erd get-transaction-cost sc-call --sc-address="sc-address-hex-encoded" --function="mint(address,uint256)" ----arguments 100 recipient-address-hex --proxy="proxy-url"
```



## Contribute

One can contribute by creating *pull requests*, or by opening *issues* for discovered bugs or desired features.

### Get started

Clone the repository and run the tests:

```
python3 -m unittest discover -s erdpy/tests
python3 -m unittest -v erdpy.tests.test_wallet
```
