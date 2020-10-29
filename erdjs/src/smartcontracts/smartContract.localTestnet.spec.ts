import { Code } from "./code";
import { SmartContract } from "./smartContract";
import { GasLimit } from "../networkParams";
import { TransactionWatcher } from "../transactionWatcher";
import { ContractFunction } from "./function";
import { Account } from "../account";
import { ProxyProvider } from "../proxyProvider";
import { NetworkConfig } from "../networkConfig";
import { TestWallets } from "../testutils/wallets";
import { describeOnlyIf } from "../testutils/utils";

describeOnlyIf("localTestnet")("test on local testnet", function () {
    this.timeout(50000);

    let localTestnet = new ProxyProvider("http://localhost:7950");
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

    it("counter: should deploy, then simulate transactions", async () => {
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

    it("counter: should deploy, call and query contract", async () => {
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
        // ++
        let transactionIncrementFirst = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(500000)
        });

        transactionIncrementFirst.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrementFirst);

        alice.incrementNonce();

        // ++
        let transactionIncrementSecond = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(500000)
        });

        transactionIncrementSecond.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrementSecond);

        alice.incrementNonce();

        // Broadcast & execute
        await transactionDeploy.send(localTestnet);
        await transactionIncrementFirst.send(localTestnet);

        await transactionDeploy.awaitExecuted(localTestnet);
        await transactionIncrementFirst.awaitExecuted(localTestnet);

        // Check counter
        let queryResponse = await contract.runQuery(localTestnet, { func: new ContractFunction("increment") });
        console.log(queryResponse.toJSON());
    });
});
