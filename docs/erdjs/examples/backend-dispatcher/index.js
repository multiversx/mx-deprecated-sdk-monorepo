const os = require("os");
const fs = require("fs");
const { Command } = require("commander");
const { ProxyProvider, SimpleSigner, Account, GasLimit, TransactionHash, TransactionPayload, NetworkConfig, Transaction, Address, Balance } = require("@elrondnetwork/erdjs");

var PROXY_URL = "https://api-testnet.elrond.com";

(async () => {
    await main();
})();

async function main() {
    const program = new Command();
    program.version("1.0.0");
    setupCli(program);

    try {
        await program.parseAsync(process.argv)
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

function setupCli(program) {
    program.name("backend-dispatcher")

    program
        .command("send-tx")
        .description("Send eGLD")
        .requiredOption("-k, --key-file <keyFile>", "the key-file (the wallet)")
        .requiredOption("-p, --password-file <passwordFile>", "the file containing the key-file password")
        .requiredOption("-r, --receiver <receiver>", "the receiver (bech32 address)")
        .requiredOption("-v, --value <value>", "the value, in eGLD")
        .action(sendTransaction);

    program
        .command("send-more-txs")
        .description("Send more transactions")
        .requiredOption("-k, --key-file <keyFile>", "the key-file (the wallet)")
        .requiredOption("-p, --password-file <passwordFile>", "the file containing the key-file password")
        .requiredOption("-r, --receiver <receiver>", "the receiver (bech32 address)")
        .requiredOption("-v, --value <value>", "the value, in eGLD")
        .requiredOption("-n, --num <num>", "number of transactions to send")
        .action(sendMoreTransactions);

    program
        .command("get-tx")
        .description("Get transaction")
        .requiredOption("-h, --hash <hash>", "the hash of the transaction")
        .action(getTransaction);

    program
        .command("get-balance")
        .description("Get balance")
        .requiredOption("-a, --address <address>", "the address to query")
        .action(getBalance);
}

async function sendTransaction(cmdObj) {
    let provider = new ProxyProvider(PROXY_URL);
    NetworkConfig.getDefault().sync(provider);

    let signer = createSigner(cmdObj.keyFile, cmdObj.passwordFile);
    let sender = new Account(signer.getAddress());
    await sender.sync(provider);
    await sendOneTransaction(provider, signer, sender, cmdObj.receiver, cmdObj.value);
}

function createSigner(keyFile, passwordFile) {
    keyFile = asUserPath(keyFile);
    passwordFile = asUserPath(passwordFile);

    let keyFileJson = readText(keyFile);
    let keyFileObject = JSON.parse(keyFileJson);
    let password = readText(passwordFile);
    let signer = SimpleSigner.fromWalletKey(keyFileObject, password);
    return signer;
}

async function sendOneTransaction(provider, signer, sender, receiverAddress, valueInEGLD) {
    let nonce = sender.nonce;
    let receiver = new Address(receiverAddress);
    let value = Balance.eGLD(valueInEGLD);
    let payload = new TransactionPayload("");
    let gasLimit = GasLimit.forTransfer(payload);
    
    let transaction = new Transaction({
        nonce: nonce,
        receiver: receiver,
        value: value,
        data: payload,
        gasLimit: gasLimit
    });

    signer.sign(transaction);
    await transaction.send(provider);
    console.log(transaction);
}

async function sendMoreTransactions(cmdObj) {
    let provider = new ProxyProvider(PROXY_URL);
    NetworkConfig.getDefault().sync(provider);

    let signer = createSigner(cmdObj.keyFile, cmdObj.passwordFile);
    let sender = new Account(signer.getAddress());
    await sender.sync(provider);

    // When sending more transactions in a row, the sender has to manage its local copy of the nonce:
    // https://docs.elrond.com/creating-transactions#nonce-management
    for (let i = 0; i < cmdObj.num; i++) {
        await sendOneTransaction(provider, signer, sender, cmdObj.receiver, cmdObj.value);
        sender.incrementNonce();
    }
}

async function getTransaction(cmdObj) {
    let provider = new ProxyProvider(PROXY_URL);
    let hash = new TransactionHash(cmdObj.hash);
    let transaction = await provider.getTransaction(hash);

    console.log(transaction);
    console.log(transaction.status.isExecuted());
    console.log(transaction.status.isSuccessful());
}

async function getBalance(cmdObj) {
    let provider = new ProxyProvider(PROXY_URL);
    let address = new Address(cmdObj.address)
    let balance = await provider.getBalance(address)

    console.log(balance);
    console.log(balance.raw());
    console.log(balance.formatted());
}

function asUserPath(userPath) {
    return (userPath || "").replace("~", os.homedir);
}

function readText(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf8" }).trim();
}
