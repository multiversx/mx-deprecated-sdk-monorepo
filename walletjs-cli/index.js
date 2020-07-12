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
        console.error(error.toString());
        throw error;
    }
}

function setupCli(program) {
    program
        .command("generate-mnemonic")
        .description("Generate a new mnemonic phrase (24 words) and write it to a file")
        .requiredOption("-o, --out-file <outFile>", "where to write the mnemonic")
        .option("-d, --display", "also display mnemonic in stdout")
        .action(generateMnemonic);

    program
        .command("generate-key-file")
        .description("Generate a new JSON key-file from a given mnemonic")
        .requiredOption("-m, --mnemonic-file <mnemonicFile>", "the file containing the mnemonic")
        .requiredOption("-p, --password-file <passwordFile>", "the file containing the password for the key-file")
        .requiredOption("-o, --out-file <outFile>", "where to save the key-file")
        .option("-i, --index <index>", "the index of the wallet to derive", "0")
        .action(generateKeyFile);

    program
        .command("sign")
        .description("Read a JSON message (transaction), sign it, then write it to a file")
        .requiredOption("-i, --in-file <inFile>", "the file containing the JSON message (transaction)")
        .requiredOption("-o, --out-file <outFile>", "where to save the signed JSON message (transaction)")
        .requiredOption("-k, --key-file <keyFile>", "the JSON key-file (the wallet)")
        .requiredOption("-p, --password-file <passwordFile>", "a file containing the password in clear text")
        .action(signMessage);
}

function generateMnemonic(cmdObj) {
    let outFile = asUserPath(cmdObj.outFile);
    let display = cmdObj.display;
    let account = new core.account();
    let mnemonic = account.generateMnemonic();

    guardFileNotExists(outFile);
    fs.writeFileSync(outFile, `${mnemonic}\n`);

    if (display) {
        console.log(mnemonic);
    }
}

function generateKeyFile(cmdObj) {
    let mnemonicFile = asUserPath(cmdObj.mnemonicFile);
    let passwordFile = asUserPath(cmdObj.passwordFile);
    let outFile = asUserPath(cmdObj.outFile);
    let index = parseInt(cmdObj.index) || 0;

    let mnemonic = readText(mnemonicFile);
    let password = readText(passwordFile);

    let account = new core.account();
    let privateKeyHex = account.privateKeyFromMnemonic(mnemonic, false, index.toString(), "");
    let privateKey = Buffer.from(privateKeyHex, "hex");
    let keyFile = account.generateKeyFileFromPrivateKey(privateKey, password);
    let keyFileJson = JSON.stringify(keyFile, null, 4);

    guardFileNotExists(outFile);
    fs.writeFileSync(outFile, `${keyFileJson}\n`);
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

    guardFileNotExists(outFile);
    fs.writeFileSync(outFile, `${signedTransactionJson}\n`);
}

function asUserPath(userPath) {
    return userPath.replace("~", os.homedir);
}

function readText(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf8" }).trim();
}

function guardFileNotExists(filePath) {
    if (fs.existsSync(filePath)) {
        throw Error(`File ${filePath} must not exist, it won't be overwritten.`);
    }
}
