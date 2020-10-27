import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../address";
import { Code } from "./code";
import { Nonce } from "../nonce";
import { SmartContract } from "./smartContract";
import { GasLimit } from "../networkParams";
import { SimpleSigner } from "../simpleSigner";
import { MockProvider, Wait } from "../testutils/mockProvider";
import { TransactionWatcher } from "../transactionWatcher";
import { TransactionStatus } from "../transaction";
import { Argument } from "./argument";
import { ContractFunction } from "./function";
import { Account } from "../account";
import { ProxyProvider } from "../proxyProvider";
import { NetworkConfig } from "../networkConfig";
import { TestWallets } from "../testutils/wallets";


describe("test contract", () => {
    let provider = new MockProvider();
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

    it("should compute contract address", async () => {
        let owner = new Address("93ee6143cdc10ce79f15b2a6c2ad38e9b6021c72a1779051f47154fd54cfbd5e");

        let firstContractAddress = SmartContract.computeAddress(owner, new Nonce(0));
        assert.equal(firstContractAddress.hex(), "00000000000000000500bb652200ed1f994200ab6699462cab4b1af7b11ebd5e");
        assert.equal(firstContractAddress.bech32(), "erd1qqqqqqqqqqqqqpgqhdjjyq8dr7v5yq9tv6v5vt9tfvd00vg7h40q6779zn");

        let secondContractAddress = SmartContract.computeAddress(owner, new Nonce(1));
        assert.equal(secondContractAddress.hex(), "000000000000000005006e4f90488e27342f9a46e1809452c85ee7186566bd5e");
        assert.equal(secondContractAddress.bech32(), "erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy");
    });

    it("should deploy", async () => {
        setupWatcherTimeouts();

        let contract = new SmartContract({});
        let deployTransaction = contract.deploy({
            code: Code.fromBuffer(Buffer.from([1, 2, 3, 4])),
            gasLimit: new GasLimit(1000000)
        });

        provider.mockUpdateAccount(alice.address, account => {
            account.nonce = new Nonce(42);
        });

        await alice.sync(provider);
        deployTransaction.setNonce(alice.nonce);

        assert.equal(deployTransaction.data.decoded(), "01020304@0500@0100");
        assert.equal(deployTransaction.gasLimit.value, 1000000);
        assert.equal(deployTransaction.nonce.value, 42);

        // Sign transaction, then check contract address (should be computed upon signing)
        aliceSigner.sign(deployTransaction);
        assert.equal(contract.getOwner().bech32(), alice.address.bech32());
        assert.equal(contract.getAddress().bech32(), "erd1qqqqqqqqqqqqqpgq3ytm9m8dpeud35v3us20vsafp77smqghd8ss4jtm0q");

        // Now let's broadcast the deploy transaction, and wait for its execution.
        let hash = await deployTransaction.send(provider);

        await Promise.all([
            provider.mockTransactionTimeline(deployTransaction, [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed")]),
            deployTransaction.awaitExecuted(provider)
        ]);

        assert.isTrue((await provider.getTransactionStatus(hash)).isExecuted());
    });

    it("should call", async () => {
        let contract = new SmartContract({ address: new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3") });

        provider.mockUpdateAccount(alice.address, account => {
            account.nonce = new Nonce(42);
        });

        let callTransactionOne = contract.call({
            func: new ContractFunction("helloEarth"),
            args: [Argument.number(5), Argument.hex("0123")],
            gasLimit: new GasLimit(150000)
        });

        let callTransactionTwo = contract.call({
            func: new ContractFunction("helloMars"),
            args: [Argument.number(5), Argument.hex("0123")],
            gasLimit: new GasLimit(1500000)
        });

        await alice.sync(provider);
        callTransactionOne.setNonce(alice.nonce);
        alice.incrementNonce();
        callTransactionTwo.setNonce(alice.nonce);

        assert.equal(callTransactionOne.nonce.value, 42);
        assert.equal(callTransactionOne.data.decoded(), "helloEarth@05@0123");
        assert.equal(callTransactionOne.gasLimit.value, 150000);
        assert.equal(callTransactionTwo.nonce.value, 43);
        assert.equal(callTransactionTwo.data.decoded(), "helloMars@05@0123");
        assert.equal(callTransactionTwo.gasLimit.value, 1500000);

        // Sign transactions, broadcast them
        aliceSigner.sign(callTransactionOne);
        aliceSigner.sign(callTransactionTwo);

        let hashOne = await callTransactionOne.send(provider);
        let hashTwo = await callTransactionTwo.send(provider);

        await Promise.all([
            provider.mockTransactionTimeline(callTransactionOne, [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed")]),
            provider.mockTransactionTimeline(callTransactionTwo, [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed")]),
            callTransactionOne.awaitExecuted(provider),
            callTransactionTwo.awaitExecuted(provider)
        ]);

        assert.isTrue((await provider.getTransactionStatus(hashOne)).isExecuted());
        assert.isTrue((await provider.getTransactionStatus(hashTwo)).isExecuted());
    });
});

describe("test on local testnet", function () {
    this.timeout(50000);

    let localTestnet = new ProxyProvider("http://localhost:7950");
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

    it.skip("should deploy, then simulate transactions", async () => {
        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(localTestnet);
        await alice.sync(localTestnet);

        // Counter: deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: Code.fromFile("./src/testdata/counter.wasm"),
            gasLimit: new GasLimit(3000000)
        });

        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);

        alice.incrementNonce();

        // Counter: Increment
        let transactionIncrement = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(3000000)
        });

        transactionIncrement.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrement);

        alice.incrementNonce();

        // Now, let's build a few transactions, to be simulated
        let simulateOne = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(100000)
        });

        let simulateTwo = contract.call({
            func: new ContractFunction("foobar"),
            gasLimit: new GasLimit(500000)
        });

        simulateOne.setNonce(alice.nonce);
        simulateTwo.setNonce(alice.nonce);

        await aliceSigner.sign(simulateOne);
        await aliceSigner.sign(simulateTwo);

        // Broadcast & execute
        await transactionDeploy.send(localTestnet);
        await transactionIncrement.send(localTestnet);

        await transactionDeploy.awaitExecuted(localTestnet);
        await transactionIncrement.awaitExecuted(localTestnet);

        // Simulate
        console.log(JSON.stringify(await simulateOne.simulate(localTestnet), null, 4));
        console.log(JSON.stringify(await simulateTwo.simulate(localTestnet), null, 4));
    });
});

function setupWatcherTimeouts() {
    TransactionWatcher.DefaultPollingInterval = 42;
    TransactionWatcher.DefaultTimeout = 42 * 3;
}