# erdpy

**Development is in progress.**

Elrond - Command Line Tools and Python SDK for interacting with Smart Contracts.

One can use **erdpy** to build, test and debug Elrond smart contracts, deploy them on the testnet and interact with contracts by issuing function calls (transactions).

**Erdpy** also acts as a wrapper over the Elrond REST API.


## Installation

In order to install **erdpy**, make sure that you have **Python** installed (version **3.6** or later):

```
python3 --version
```

Then issue the following command:

```
pip3 install erdpy
```

Or, to upgrade at anytime,

```
pip3 install erdpy --upgrade
```

You can check installation as follows:
```
pip3 show erdpy
```

## Command-line interface

### List project templates

Display the list of project templates (smart contracts templates):

```
$ python3 -m erdpy.cli templates
```

Output example:

```
['adder', 'crypto-bubbles', 'erc20-c', 'factorial', 'features', 'queue', 'simple-coin', 'simple-counter', 'soll_erc20_0-0-2-sol', 'soll_erc20_0-0-3-sol', 'ultimate-answer']
```

These templates are downloaded from different sources, as configured in [templates_config.py](erdpy/projects/templates_config.py) and are written in **rust**, **C** or **Solidity**.

### Create new project

The following command creates a sample project called `hello` based on the template `ultimate-answer` (written in **C**):

```
$ python3 -m erdpy.cli new --template ultimate-answer --directory ./examples hello
$ python3 -m erdpy.cli new --template adder --directory ./examples myadder
```

### Build a project

In order to build a project you only have to specify its directory. Let's build the projects under `/example`: 

```
python3 -m erdpy.cli build ./examples/hello
python3 -m erdpy.cli build ./examples/myadder
```

The first one is written in **C**, while the second in **rust**. As you can see, the commands are similar.

### Deploy on testnet

In order to deploy a smart contract on the testnet, make sure it is already build and issue the following command:

```
python3 -m erdpy.cli deploy ./examples/hello --proxy="https://wallet-api.elrond.com" --address="8eb27b2bcaedc6de11793cf0625a4f8d64bf7ac84753a0b6c5d6ceb2be7eb39d" --pem="./examples/keys/alice.pem"
```