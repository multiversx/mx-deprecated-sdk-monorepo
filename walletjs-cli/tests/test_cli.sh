SANDBOX=./testdata-out
WALLETJS="../index.js"

testAll() {
    set -x

    cleanSandbox
    ${WALLETJS} generate-mnemonic -o ${SANDBOX}/mnemonicOfAlice.txt
    ${WALLETJS} generate-key-file -o ${SANDBOX}/walletOfAlice.json -m ${SANDBOX}/mnemonicOfAlice.txt -p ./testdata/passwordOfAlice.txt
    ${WALLETJS} generate-key-file -o ${SANDBOX}/walletOfAlice-sCat.json -m ${SANDBOX}/mnemonicOfAlice.txt -p ./testdata/passwordOfAlice.txt --index=1
    ${WALLETJS} sign -i ./testdata/aliceToBob.json -o ${SANDBOX}/aliceToBobSigned.json -k ${SANDBOX}/walletOfAlice.json -p ./testdata/passwordOfAlice.txt

    set +x
    
    assertFileExists ${SANDBOX}/mnemonicOfAlice.txt
    assertFileExists ${SANDBOX}/walletOfAlice.json
    assertFileExists ${SANDBOX}/walletOfAlice-sCat.json
    assertFileExists ${SANDBOX}/aliceToBobSigned.json
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
