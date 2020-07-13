SANDBOX=./testdata-out
WALLETJS="../index.js"

testAll() {
    cleanSandbox
    echo "Alice creates a mnemonic"
    ${WALLETJS} new --out-mnemonic-file ${SANDBOX}/mnemonicOfAlice.txt
    echo "Alice derives a key, index = 0"
    ${WALLETJS} new --key-file ${SANDBOX}/walletOfAlice.json --password-file ./testdata/passwordOfAlice.txt --in-mnemonic-file ${SANDBOX}/mnemonicOfAlice.txt
    echo "Alice derives another key, index = 1"
    ${WALLETJS} new --key-file ${SANDBOX}/walletOfAlice-sCat.json --password-file ./testdata/passwordOfAlice.txt --in-mnemonic-file ${SANDBOX}/mnemonicOfAlice.txt
    echo "Alice signs a transaction"
    ${WALLETJS} sign -i ./testdata/aliceToBob.json -o ${SANDBOX}/aliceToBobSigned.json -k ${SANDBOX}/walletOfAlice.json -p ./testdata/passwordOfAlice.txt

    assertFileExists ${SANDBOX}/mnemonicOfAlice.txt
    assertFileExists ${SANDBOX}/walletOfAlice.json
    assertFileExists ${SANDBOX}/walletOfAlice-sCat.json
    assertFileExists ${SANDBOX}/aliceToBobSigned.json
}

testErrors() {
    cleanSandbox
    echo "> Mnemonic overwrite"
    echo "foo" > ${SANDBOX}/mnemonicOfAlice.txt
    ${WALLETJS} new --out-mnemonic-file ${SANDBOX}/mnemonicOfAlice.txt

    echo "> No new mnemonic file, no existing mnemonic file"
    ${WALLETJS} new

    echo "> Bad account index"
    ${WALLETJS} new --out-mnemonic-file ${SANDBOX}/newMnemonic.txt --account-index=42
}

cleanSandbox() {
    rm -rf ${SANDBOX}
    mkdir ${SANDBOX}
}

assertFileExists() {
    if [ ! -f "$1" ]
    then
        echo "Error: file [$1] does not exist!" 1>&2
    fi
}
