# Command Line Interface

## Overview

**erdwalletjs** is a light CLI wrapper over [elrond-core-js](https://www.npmjs.com/package/@elrondnetwork/elrond-core-js) and allows one to generate mnemonics, derive key files and sign Elrond transactions.
It exposes the following **commands**:


```
$ erdwalletjs --help
Usage: erdwalletjs [options] [command]

Options:
  -V, --version           output the version number
  -h, --help              display help for command

Commands:
  new-mnemonic [options]  Create a new mnemonic phrase (24 words)
  derive-key [options]    Derive a JSON key-file from an existing mnemonic
                          phrase
  sign [options]          Sign a JSON transaction
  help [command]          display help for command

```
### New Mnemonic


```
$ erdwalletjs new-mnemonic --help
Usage: erdwalletjs new-mnemonic [options]

Create a new mnemonic phrase (24 words)

Options:
  -m, --mnemonic-file <mnemonicFile>  where to save the mnemonic
  -h, --help                          display help for command

```


### Derive Key File


```
$ erdwalletjs derive-key --help
Usage: erdwalletjs derive-key [options]

Derive a JSON key-file from an existing mnemonic phrase

Options:
  -m, --mnemonic-file <mnemonicFile>  a file containing the mnemonic
  -n, --account-index <accountIndex>  the account index to derive (default:
                                      "0")
  -k, --key-file <keyFile>            the key-file to create
  -p, --password-file <passwordFile>  a file containing the password for the
                                      key-file
  -h, --help                          display help for command

```


### Sign


```
$ erdwalletjs sign --help
Usage: erdwalletjs sign [options]

Sign a JSON transaction

Options:
  -i, --in-file <inFile>              the file containing the JSON transaction
  -o, --out-file <outFile>            where to save the signed JSON transaction
  -k, --key-file <keyFile>            the key-file (the wallet)
  -p, --password-file <passwordFile>  the file containing the key-file password
  -h, --help                          display help for command

```


