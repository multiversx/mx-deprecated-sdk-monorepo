import { NetworkConfig } from "../networkConfig";
import { getLocalTestnetProvider, loadContractCode, loadTestWallets, TestWallet } from "../testutils";
import { TransactionWatcher } from "../transactionWatcher";
import { ContractFunction, SmartContract } from ".";
import { GasLimit } from "../networkParams";
import { assert } from "chai";

describe("fetch transactions from devnet", function () {
    let devnet = getLocalTestnetProvider();
    let alice: TestWallet;
    before(async function () {
        ({ alice } = await loadTestWallets());
    });

    it("counter smart contract", async function () {
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

        transactionDeploy.setNonce(alice.account.nonce);
        await alice.signer.sign(transactionDeploy);

        alice.account.incrementNonce();

        // ++
        let transactionIncrement = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(3000000)
        });

        transactionIncrement.setNonce(alice.account.nonce);
        await alice.signer.sign(transactionIncrement);

        alice.account.incrementNonce();

        // Broadcast & execute
        await transactionDeploy.send(devnet);
        await transactionIncrement.send(devnet);

        await transactionDeploy.awaitExecuted(devnet);
        await transactionIncrement.awaitExecuted(devnet);

        await transactionDeploy.getAsOnNetwork(devnet);
        await transactionIncrement.getAsOnNetwork(devnet);

        let deployImmediateResult = transactionDeploy.getAsOnNetworkCached().getSmartContractResults().getImmediate();
        let deployResultingCalls = transactionDeploy.getAsOnNetworkCached().getSmartContractResults().getResultingCalls();
        let incrementImmediateResult = transactionIncrement.getAsOnNetworkCached().getSmartContractResults().getImmediate();
        let incrementResultingCalls = transactionIncrement.getAsOnNetworkCached().getSmartContractResults().getResultingCalls();

        deployImmediateResult.assertSuccess();
        incrementImmediateResult.assertSuccess();

        assert.lengthOf(deployImmediateResult.outputUntyped(), 0);
        // There is some refund
        assert.isTrue(deployImmediateResult.value.valueOf().gt(0));
        assert.lengthOf(deployResultingCalls, 0);

        assert.lengthOf(incrementImmediateResult.outputUntyped(), 1);
        // There is some refund
        assert.isTrue(incrementImmediateResult.value.valueOf().gt(0));
        assert.lengthOf(incrementResultingCalls, 0);
    });

    it("ESDT", async function () {
        this.timeout(60000);

        TransactionWatcher.DefaultPollingInterval = 5000;
        TransactionWatcher.DefaultTimeout = 50000;

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);
    });
});
