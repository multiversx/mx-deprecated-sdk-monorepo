#!/usr/bin/env bash

source "./shared.sh"

startDevnetInBackground() {
    pushd .

    cleanSandbox
    mkdir -p ${SANDBOX}/cli_all && cd ${SANDBOX}/cli_all
    ${ERDPY} testnet prerequisites &> prerequisites.out
    ${ERDPY} --verbose testnet config &> config.out
    ${ERDPY} --verbose testnet start &> start.out &
    export TESTNET_PID=$!

    popd
}

testAgainstDevnet() {
    source ./test_cli_validators.sh && testAll
    source ./test_cli_tx.sh && testAll
    source ./test_cli_network.sh && testAll
}

testAll() {
    source ./tests.sh && runShortTests
    source ./test_cli_wallet.sh && testAll
    source ./test_cli_contracts.sh && testAll
    source ./test_cli_validators.sh && testAll
    source ./test_cli_tx.sh && testAll
    source ./test_cli_config.sh && testAll
    source ./test_cli_network.sh && testAll
    source ./test_cli_cost.sh && testAll
}

stopDevnet() {
    kill $TESTNET_PID
    wait $TESTNET_PID
}
