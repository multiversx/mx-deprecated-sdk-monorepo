import { Account } from "./account";
import { NetworkConfig } from "./networkConfig";
import { getDevnetProvider, loadContractCode, TestWallets } from "./testutils";
import { TransactionWatcher } from "./transactionWatcher";
import { ContractFunction, SmartContract } from "./smartcontracts";
import { GasLimit } from "./networkParams";
import { assert } from "chai";

describe.only("fetch transactions from devnet", function () {
    let devnet = getDevnetProvider();
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

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

        transactionDeploy.setNonce(alice.nonce);
        await aliceSigner.sign(transactionDeploy);

        alice.incrementNonce();

        // ++
        let transactionIncrement = contract.call({
            func: new ContractFunction("increment"),
            gasLimit: new GasLimit(700000)
        });

        transactionIncrement.setNonce(alice.nonce);
        await aliceSigner.sign(transactionIncrement);

        alice.incrementNonce();

        // Broadcast & execute
        await transactionDeploy.send(devnet);
        await transactionIncrement.send(devnet);

        await transactionDeploy.awaitExecuted(devnet);
        await transactionIncrement.awaitExecuted(devnet);

        await transactionDeploy.getAsOnNetwork(devnet);
        console.log(transactionDeploy.getAsOnNetworkCached());

        await transactionIncrement.getAsOnNetwork(devnet);
        console.log(transactionIncrement.getAsOnNetworkCached());
    });
});
