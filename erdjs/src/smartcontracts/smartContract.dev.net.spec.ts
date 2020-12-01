import { Code } from "./code";
import { SmartContract } from "./smartContract";
import { GasLimit } from "../networkParams";
import { TransactionWatcher } from "../transactionWatcher";
import { ContractFunction } from "./function";
import { Account } from "../account";
import { NetworkConfig } from "../networkConfig";
import { TestWallets } from "../testutils/wallets";
import { getDevnetProvider } from "../testutils";
import { Logger } from "../logger";
import { Argument } from "./argument";
import { assert } from "chai";
import { Balance } from "../balance";
import { OptionalValue, U32Value } from "./typesystem";

describe("test on devnet (local)", function () {
    let devnet = getDevnetProvider();
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

    it("counter: should deploy, then simulate transactions", async function() {
        this.timeout(50000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await Code.fromFile("./src/testdata/counter.wasm"),
            gasLimit: new GasLimit(3000000)
        });

        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);

        alice.incrementNonce();

        // ++
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
        await transactionDeploy.send(devnet);
        await transactionIncrement.send(devnet);

        await transactionDeploy.awaitExecuted(devnet);
        await transactionIncrement.awaitExecuted(devnet);

        // Simulate
        Logger.trace(JSON.stringify(await simulateOne.simulate(devnet), null, 4));
        Logger.trace(JSON.stringify(await simulateTwo.simulate(devnet), null, 4));
    });

    it("counter: should deploy, call and query contract", async function() {
        this.timeout(50000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await Code.fromFile("./src/testdata/counter.wasm"),
            gasLimit: new GasLimit(3000000)
        });

        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);

        alice.incrementNonce();

        // ++
        let transactionIncrementFirst = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(700000)
        });

        transactionIncrementFirst.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrementFirst);

        alice.incrementNonce();

        // ++
        let transactionIncrementSecond = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(700000)
        });

        transactionIncrementSecond.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrementSecond);

        alice.incrementNonce();

        // Broadcast & execute
        await transactionDeploy.send(devnet);
        await transactionIncrementFirst.send(devnet);
        await transactionIncrementSecond.send(devnet);

        await transactionDeploy.awaitExecuted(devnet);
        await transactionIncrementFirst.awaitExecuted(devnet);
        await transactionIncrementSecond.awaitExecuted(devnet);

        // Check counter
        let queryResponse = await contract.runQuery(devnet, { func: new ContractFunction("get") });
        assert.equal(3, queryResponse.firstResult().asNumber);
    });

    it("erc20: should deploy, call and query contract", async function() {
        this.timeout(50000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await Code.fromFile("./src/testdata/erc20.wasm"),
            gasLimit: new GasLimit(50000000),
            initArguments: [Argument.fromNumber(10000)]
        });

        // The deploy transaction should be signed, so that the address of the contract
        // (required for the subsequent transactions) is computed.
        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);
        alice.incrementNonce();

        // Minting
        let transactionMintBob = contract.call({
            func: new ContractFunction("transferToken"),
            gasLimit: new GasLimit(5000000),
            args: [Argument.fromPubkey(wallets.bob.address), Argument.fromNumber(1000)]
        });

        let transactionMintCarol = contract.call({
            func: new ContractFunction("transferToken"),
            gasLimit: new GasLimit(5000000),
            args: [Argument.fromPubkey(wallets.carol.address), Argument.fromNumber(1500)]
        });

        // Apply nonces and sign the remaining transactions
        transactionMintBob.setNonce(alice.nonce);
        alice.incrementNonce();
        transactionMintCarol.setNonce(alice.nonce);
        alice.incrementNonce();

        await aliceSigner.sign(transactionMintBob);
        await aliceSigner.sign(transactionMintCarol);

        // Broadcast & execute
        await transactionDeploy.send(devnet);
        await transactionMintBob.send(devnet);
        await transactionMintCarol.send(devnet);

        await transactionDeploy.awaitExecuted(devnet);
        await transactionMintBob.awaitExecuted(devnet);
        await transactionMintCarol.awaitExecuted(devnet);

        // Query state, do some assertions
        let queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("totalSupply")
        });
        assert.equal(10000, queryResponse.firstResult().asNumber);

        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("balanceOf"),
            args: [Argument.fromPubkey(wallets.alice.address)]
        });
        assert.equal(7500, queryResponse.firstResult().asNumber);

        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("balanceOf"),
            args: [Argument.fromPubkey(wallets.bob.address)]
        });
        assert.equal(1000, queryResponse.firstResult().asNumber);

        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("balanceOf"),
            args: [Argument.fromPubkey(wallets.carol.address)]
        });
        assert.equal(1500, queryResponse.firstResult().asNumber);
    });

    it("lottery: should deploy, call and query contract", async function() {
        this.timeout(50000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await Code.fromFile("./src/testdata/lottery-egld.wasm"),
            gasLimit: new GasLimit(100000000),
            initArguments: []
        });

        // The deploy transaction should be signed, so that the address of the contract
        // (required for the subsequent transactions) is computed.
        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);
        alice.incrementNonce();

        // Start
        let transactionStart = contract.call({
            func: new ContractFunction("start"),
            gasLimit: new GasLimit(50000000),
            args: [
                Argument.fromUTF8("foobar"), 
                Argument.fromBigInt(Balance.eGLD(1).valueOf()),
                Argument.fromMissingOptional(),
                Argument.fromMissingOptional(),
                Argument.fromProvidedOptional(new U32Value(1)),
                Argument.fromMissingOptional(),
                Argument.fromMissingOptional()
            ]
        });

        // Apply nonces and sign the remaining transactions
        transactionStart.setNonce(alice.nonce);

        await aliceSigner.sign(transactionStart);

        // Broadcast & execute
        await transactionDeploy.send(devnet);
        await transactionStart.send(devnet);

        await transactionDeploy.awaitExecuted(devnet);
        await transactionStart.awaitExecuted(devnet);

        // Query state, do some assertions
        let queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("lotteryExists"),
            args: [
                Argument.fromUTF8("foobar")
            ]
        });
        assert.equal(queryResponse.firstResult().asBool, true);

        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("lotteryExists"),
            args: [
                Argument.fromUTF8("missingLottery")
            ]
        });
        assert.equal(queryResponse.firstResult().asBool, false);
    });
});
