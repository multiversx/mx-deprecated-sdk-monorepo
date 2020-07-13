# Command Line Interface

## Overview

**erd-walletjs-cli** exposes the following **commands**:


```
$ erd-walletjs-cli --help
Usage: erd-walletjs-cli [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  new [options]   Create a wallet based on a new or existing mnemonic phrase
  sign [options]  Sign a JSON transaction
  help [command]  display help for command

```
### New


```
$ erd-walletjs-cli new --help
Usage: erd-walletjs-cli new [options]

Create a wallet based on a new or existing mnemonic phrase

Options:
  --in-mnemonic-file <inMnemonicFile>    the file containing an existing mnemonic
  --out-mnemonic-file <outMnemonicFile>  where to save the new mnemonic, if it's the case
  --account-index <accountIndex>         the index of the wallet to derive (default: "0")
  --password-file <passwordFile>         the file containing the key-file password
  --key-file <keyFile>                   where to save the key-file
  -h, --help                             display help for command

```


### Sign


```
$ erd-walletjs-cli sign --help
Usage: erd-walletjs-cli sign [options]

Sign a JSON transaction

Options:
  -i, --in-file <inFile>              the file containing the JSON transaction
  -o, --out-file <outFile>            where to save the signed JSON transaction
  -k, --key-file <keyFile>            the key-file (the wallet)
  -p, --password-file <passwordFile>  the file containing the key-file password
  -h, --help                          display help for command

```


