#!/usr/bin/env bash

WALLETJS="./index.js"

code() {
    printf "\n\`\`\`\n" >> README.md
}

cliCommand() {
    printf "### $1\n\n" >> README.md

    code
    printf "$ erdwalletjs $2 --help\n" >> README.md
    ${WALLETJS} ${2} --help >> README.md
    code
    printf "\n\n" >> README.md
}

generate() {
    echo -n > README.md
    printf "# Command Line Interface\n\n" >> README.md

    printf "## Overview\n\n" >> README.md
    printf "**erdwalletjs** is a light CLI wrapper over [elrond-core-js](https://www.npmjs.com/package/@elrondnetwork/elrond-core-js) and allows one to generate mnemonics, derive key files and sign Elrond transactions.\n" >> README.md
    printf "It exposes the following **commands**:\n\n" >> README.md

    code
    printf "$ erdwalletjs --help\n" >> README.md
    ${WALLETJS} --help >> README.md
    code

    cliCommand "New Mnemonic" "new-mnemonic"
    cliCommand "Derive Key File" "derive-key"
    cliCommand "Sign" "sign"
}

