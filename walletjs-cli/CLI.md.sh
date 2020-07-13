#!/usr/bin/env bash

WALLETJS="./index.js"

code() {
    printf "\n\`\`\`\n" >> CLI.md
}

cliCommand() {
    printf "### $1\n\n" >> CLI.md

    code
    printf "$ erd-walletjs-cli $2 --help\n" >> CLI.md
    ${WALLETJS} ${2} --help >> CLI.md
    code
    printf "\n\n" >> CLI.md
}

generate() {
    echo -n > CLI.md
    printf "# Command Line Interface\n\n" >> CLI.md

    printf "## Overview\n\n" >> CLI.md
    printf "**erd-walletjs-cli** exposes the following **commands**:\n\n" >> CLI.md

    code
    printf "$ erd-walletjs-cli --help\n" >> CLI.md
    ${WALLETJS} --help >> CLI.md
    code

    cliCommand "New" "new"
    cliCommand "Sign" "sign"
}

