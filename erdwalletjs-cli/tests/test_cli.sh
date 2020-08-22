SANDBOX=./testdata-out
WALLETJS="../index.js"

testAll() {
    testErrors
    testHappyCases
}

testHappyCases() {
    cleanSandbox
    echo "> Alice creates a mnemonic"
    ${WALLETJS} new-mnemonic -m ${SANDBOX}/mnemonicOfAlice.txt
    echo "> Alice derives a key, index = 0"
    ${WALLETJS} derive-key -m ${SANDBOX}/mnemonicOfAlice.txt -k ${SANDBOX}/keyOfAlice.json -p ./testdata/passwordOfAlice.txt 
    echo "> Alice derives another key, index = 1"
    ${WALLETJS} derive-key -m ${SANDBOX}/mnemonicOfAlice.txt -n 1 -k ${SANDBOX}/keyOfAlice-sCat.json -p ./testdata/passwordOfAlice-sCat.txt
    echo "> Alice signs a transaction"
    ${WALLETJS} sign -i ./testdata/txToBob42.json -o ${SANDBOX}/txToBob42Signed.json -k ${SANDBOX}/keyOfAlice.json -p ./testdata/passwordOfAlice.txt
    echo "> Alice's cat signs a transaction"
    ${WALLETJS} sign -i ./testdata/txToBob43.json -o ${SANDBOX}/txToBob43Signed.json -k ${SANDBOX}/keyOfAlice-sCat.json -p ./testdata/passwordOfAlice-sCat.txt

    assertFileExists ${SANDBOX}/mnemonicOfAlice.txt
    assertFileExists ${SANDBOX}/keyOfAlice.json
    assertFileExists ${SANDBOX}/keyOfAlice-sCat.json
    assertFileExists ${SANDBOX}/txToBob42Signed.json
    assertFileExists ${SANDBOX}/txToBob43Signed.json
}

testErrors() {
    cleanSandbox

    echo "Setup"
    echo "size effort awful stand explain learn route protect armed truck dilemma boy empower frown disorder derive gown element indoor wrist jewel outdoor uncover brave" > ${SANDBOX}/mnemonicOfAlice.txt
    ${WALLETJS} derive-key -m ${SANDBOX}/mnemonicOfAlice.txt -k ${SANDBOX}/keyOfAlice.json -p ./testdata/passwordOfAlice.txt

    echo "> Won't overwrite existing mnemonic"
    ${WALLETJS} new-mnemonic -m ${SANDBOX}/mnemonicOfAlice.txt 2>${SANDBOX}/error.txt
    assertFileContains ${SANDBOX}/error.txt "must not exist, it won't be overwritten"

    echo "> Derive using a non-existing password file"
    ${WALLETJS} derive-key -m ${SANDBOX}/mnemonicOfAlice.txt -k ${SANDBOX}/keyOfAlice.json -p ./thisDoesNotExist.txt 2>${SANDBOX}/error.txt
    assertFileContains ${SANDBOX}/error.txt "no such file or directory"

    echo "> Bad password"
    ${WALLETJS} sign -i ./testdata/txToBob.json -o ${SANDBOX}/txToBobSigned.json -k ${SANDBOX}/keyOfAlice.json -p ./testdata/passwordOfAlice-sCat.txt 2>${SANDBOX}/error.txt
    assertFileContains ${SANDBOX}/error.txt "possibly wrong password"
}

cleanSandbox() {
    rm -rf ${SANDBOX}
    mkdir ${SANDBOX}
}

assertFileExists() {
    if [ ! -f "$1" ]
    then
        echo "Error: File [$1] does not exist!" 1>&2
    fi
}

assertFileContains() {
    if grep -q "$2" "$1"
    then
        echo "Found [$2]."
    else
        echo "Error: File [$1] does not contain [$2]!" 1>&2
    fi
}