#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const { Command } = require("commander");
const core = require("@elrondnetwork/elrond-core-js");

main();

function main() {
    const program = new Command();
    program.version("1.0.0");
    setupCli(program);

    try {
        program.parse(process.argv)
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

function setupCli(program) {
    program.name("erdwalletjs")

    program
        .command("new")
        .description("Create a wallet based on a new or existing mnemonic phrase")
        .option("--in-mnemonic-file <inMnemonicFile>", "the file containing an existing mnemonic")
        .option("--out-mnemonic-file <outMnemonicFile>", "where to save the new mnemonic, if it's the case")
        .option("--account-index <accountIndex>", "the index of the wallet to derive", "0")
        .option("--password-file <passwordFile>", "the file containing the key-file password")
        .option("--key-file <keyFile>", "where to save the key-file")
        .action(tryAction(newWallet));

    program
        .command("sign")
        .description("Sign a JSON transaction")
        .requiredOption("-i, --in-file <inFile>", "the file containing the JSON transaction")
        .requiredOption("-o, --out-file <outFile>", "where to save the signed JSON transaction")
        .requiredOption("-k, --key-file <keyFile>", "the key-file (the wallet)")
        .requiredOption("-p, --password-file <passwordFile>", "the file containing the key-file password")
        .action(tryAction(signMessage));
}

function tryAction(action) {
    return function (cmdObj) {
        try {
            action(cmdObj);
        } catch (error) {
            if (error instanceof UsageError) {
                console.error(`Usage error: ${error.message}`);
                cmdObj.help();
            } else {
                throw error;
            }
        }
    }
}

function newWallet(cmdObj) {
    let passwordFile = asUserPath(cmdObj.passwordFile);
    let keyFile = asUserPath(cmdObj.keyFile);
    let accountIndex = parseInt(cmdObj.index) || 0;

    let mnemonic = getOrGenerateMnemonic(cmdObj);

    if (!keyFile) {
        // Mnemonic generated and displayed, but no keyfile will be generated.
        return;
    }

    let password = readText(passwordFile);
    let keyFileJson = deriveWallet(mnemonic, accountIndex, password);

    writeToNewFile(keyFile, `${keyFileJson}\n`)
}

function getOrGenerateMnemonic(cmdObj) {
    let inMnemonicFile = asUserPath(cmdObj.inMnemonicFile);
    let outMnemonicFile = asUserPath(cmdObj.outMnemonicFile);

    if (inMnemonicFile) {
        return readText(inMnemonicFile);
    }

    if (!outMnemonicFile) {
        throw new UsageError("Should specify where to save the mnemonic.");
    }

    let account = new core.account();
    let mnemonic = account.generateMnemonic();

    writeToNewFile(outMnemonicFile, `${mnemonic}\n`)
    console.log(`Mnemonic saved to file: ${outMnemonicFile}.`);
    console.log(`\n${mnemonic}\n`);

    return mnemonic;
}

function deriveWallet(mnemonic, accountIndex, password) {
    let account = new core.account();
    let privateKeyHex = account.privateKeyFromMnemonic(mnemonic, false, accountIndex.toString(), "");
    let privateKey = Buffer.from(privateKeyHex, "hex");
    let keyFileObject = account.generateKeyFileFromPrivateKey(privateKey, password);
    let keyFileJson = JSON.stringify(keyFileObject, null, 4);
    return keyFileJson;
}

function signMessage(cmdObj) {
    let inFile = asUserPath(cmdObj.inFile);
    let outFile = asUserPath(cmdObj.outFile);
    let keyFile = asUserPath(cmdObj.keyFile);
    let passwordFile = asUserPath(cmdObj.passwordFile);

    let inFileJson = readText(inFile);
    let message = JSON.parse(inFileJson);
    let keyFileJson = readText(keyFile);
    let keyFileObject = JSON.parse(keyFileJson);
    let password = readText(passwordFile);

    let account = new core.account();
    account.loadFromKeyFile(keyFileObject, password);

    let transaction = new core.transaction(
        message.nonce,
        message.sender,
        message.receiver,
        message.value,
        message.gasPrice,
        message.gasLimit,
        message.data,
        message.chainID,
        message.version
    );

    let serializedTransaction = transaction.prepareForSigning();
    transaction.signature = account.sign(serializedTransaction);
    let signedTransaction = transaction.prepareForNode();
    let signedTransactionJson = JSON.stringify(signedTransaction, null, 4);

    writeToNewFile(outFile, `${signedTransactionJson}\n`);
}

function asUserPath(userPath) {
    return (userPath || "").replace("~", os.homedir);
}

function readText(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf8" }).trim();
}

function writeToNewFile(filePath, content) {
    if (fs.existsSync(filePath)) {
        throw new Error(`File ${filePath} must not exist, it won't be overwritten.`);
    }

    fs.writeFileSync(filePath, content);
}

function UsageError(message) {
    this.message = message;

    this.toString = function () {
        return message;
    }
}