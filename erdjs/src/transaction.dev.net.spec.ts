import { Transaction } from "./transaction";
import { GasLimit } from "./networkParams";
import { Account } from "./account";
import { TransactionPayload } from "./transactionPayload";
import { NetworkConfig } from "./networkConfig";
import { Balance } from "./balance";
import { TestWallets } from "./testutils";
import { getDevnetProvider } from "./testutils";
import { Logger } from "./logger";
import { assert } from "chai";

describe("test transaction", function () {
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;
    let bobWallet = wallets.bob;
    let bob = new Account(bobWallet.address);

    it("should send transactions", async function() {
        this.timeout(20000);

        let devnet = getDevnetProvider();

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        await bob.sync(devnet);
        let initialBalanceOfBob = bob.balance;

        let transactionOne = new Transaction({
            receiver: bob.address,
            value: Balance.eGLD(42)
        });

        let transactionTwo = new Transaction({
            receiver: bob.address,
            value: Balance.eGLD(43)
        });

        transactionOne.setNonce(alice.nonce);
        alice.incrementNonce();
        transactionTwo.setNonce(alice.nonce);

        await aliceSigner.sign(transactionOne);
        await aliceSigner.sign(transactionTwo);

        await transactionOne.send(devnet);
        await transactionTwo.send(devnet);

        await transactionOne.awaitExecuted(devnet);
        await transactionTwo.awaitExecuted(devnet);

        await bob.sync(devnet);
        let newBalanceOfBob = bob.balance;

        assert.deepEqual(Balance.eGLD(85).valueOf(), newBalanceOfBob.valueOf().minus(initialBalanceOfBob.valueOf()));
    });

    it("should simulate transactions", async function() {
        this.timeout(20000);

        let devnet = getDevnetProvider();

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        let transactionOne = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: alice.address,
            value: Balance.eGLD(1000)
        });

        let transactionTwo = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: alice.address,
            value: Balance.eGLD(1000000)
        });

        transactionOne.setNonce(alice.nonce);
        transactionTwo.setNonce(alice.nonce);

        await aliceSigner.sign(transactionOne);
        await aliceSigner.sign(transactionTwo);

        Logger.trace(JSON.stringify(await transactionOne.simulate(devnet), null, 4));
        Logger.trace(JSON.stringify(await transactionTwo.simulate(devnet), null, 4));
    });
});
