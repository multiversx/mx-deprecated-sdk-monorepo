import { SmartContract } from "./smartContract";
import { GasLimit } from "../networkParams";
import { TransactionWatcher } from "../transactionWatcher";
import { ContractFunction } from "./function";
import { Account } from "../account";
import { NetworkConfig } from "../networkConfig";
import { TestWallets } from "../testutils/wallets";
import { getDevnetProvider, loadContractCode } from "../testutils";
import { Logger } from "../logger";
import { assert } from "chai";
import { Balance } from "../balance";
import { missingOption, providedOption, typedAddress, typedBigInt, typedNumber, typedUTF8, U32Value } from "./typesystem";
import { decodeBool, decodeUnsignedNumber } from "./codec";

describe("test on devnet (local)", function () {
    let devnet = getDevnetProvider();
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

    it("counter: should deploy, then simulate transactions", async function() {
        this.timeout(60000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await loadContractCode("src/testdata/counter.wasm"),
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
        this.timeout(80000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await loadContractCode("src/testdata/counter.wasm"),
            gasLimit: new GasLimit(3000000)
        });

        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);

        alice.incrementNonce();

        // ++
        let transactionIncrementFirst = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(2000000)
        });

        transactionIncrementFirst.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrementFirst);

        alice.incrementNonce();

        // ++
        let transactionIncrementSecond = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(2000000)
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
        assert.equal(3, decodeUnsignedNumber(queryResponse.outputUntyped()[0]));
    });

    it("erc20: should deploy, call and query contract", async function() {
        this.timeout(60000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await loadContractCode("src/testdata/erc20.wasm"),
            gasLimit: new GasLimit(50000000),
            initArguments: [typedNumber(10000)]
        });

        // The deploy transaction should be signed, so that the address of the contract
        // (required for the subsequent transactions) is computed.
        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);
        alice.incrementNonce();

        // Minting
        let transactionMintBob = contract.call({
            func: new ContractFunction("transferToken"),
            gasLimit: new GasLimit(9000000),
            args: [typedAddress(wallets.bob.address), typedNumber(1000)]
        });

        let transactionMintCarol = contract.call({
            func: new ContractFunction("transferToken"),
            gasLimit: new GasLimit(9000000),
            args: [typedAddress(wallets.carol.address), typedNumber(1500)]
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
        assert.equal(10000, decodeUnsignedNumber(queryResponse.outputUntyped()[0]));

        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("balanceOf"),
            args: [typedAddress(wallets.alice.address)]
        });
        assert.equal(7500, decodeUnsignedNumber(queryResponse.outputUntyped()[0]));
        
        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("balanceOf"),
            args: [typedAddress(wallets.bob.address)]
        });
        assert.equal(1000, decodeUnsignedNumber(queryResponse.outputUntyped()[0]));
        
        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("balanceOf"),
            args: [typedAddress(wallets.carol.address)]
        });
        assert.equal(1500, decodeUnsignedNumber(queryResponse.outputUntyped()[0]));
    });

    it("lottery: should deploy, call and query contract", async function() {
        this.timeout(60000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        // Deploy
        let contract = new SmartContract({});
        let transactionDeploy = contract.deploy({
            code: await loadContractCode("src/testdata/lottery_egld.wasm"),
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
            gasLimit: new GasLimit(15000000),
            args: [
                typedUTF8("foobar"), 
                typedBigInt(Balance.egld(1).valueOf()),
                missingOption(),
                missingOption(),
                providedOption(new U32Value(1)),
                missingOption(),
                missingOption()
            ]
        });

        // Apply nonces and sign the remaining transactions
        transactionStart.setNonce(alice.nonce);

        await aliceSigner.sign(transactionStart);

        // Broadcast & execute
        await transactionDeploy.send(devnet);
        await transactionStart.send(devnet);

        await transactionDeploy.awaitNotarized(devnet);
        await transactionStart.awaitNotarized(devnet);

        // Let's check the SCRs
        let deployResults = (await transactionDeploy.getAsOnNetwork(devnet)).getSmartContractResults();
        deployResults.getImmediate().assertSuccess();

        let startResults = (await transactionStart.getAsOnNetwork(devnet)).getSmartContractResults();
        startResults.getImmediate().assertSuccess();

        // Query state, do some assertions
        let queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("status"),
            args: [
                typedUTF8("foobar")
            ]
        });
        assert.equal(decodeUnsignedNumber(queryResponse.outputUntyped()[0]), 1);

        queryResponse = await contract.runQuery(devnet, {
            func: new ContractFunction("status"),
            args: [
                typedUTF8("missingLottery")
            ]
        });
        assert.equal(decodeUnsignedNumber(queryResponse.outputUntyped()[0]), 0);
    });
});
